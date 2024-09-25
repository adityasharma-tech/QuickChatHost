import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

// firebase
import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

// sockets & Db
import { Server as SocketIO } from "socket.io";

import { createClient as createRedisClient } from "redis";
import connectDB from "./lib/db.js";

// &utils
import { ApiResponse } from "./utils/ApiResponse.js";
import { ApiError } from "./utils/ApiError.js";

// constants
import { PORT } from "./lib/constants.js";

dotenv.config({ path: "./.env" });

// import serviceAccount from "./config/fbadmin.creds.json" assert { type: "json" };

const app = express();
const server = http.createServer(app);
const redisClient = createRedisClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 16399,
    rejectUnauthorized: false,
  },
});

const firebaseApp = initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  }),
  databaseURL: process.env.DATABASE_URL,
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error: ", err);
  process.exit(1);
});

redisClient.connect().then(() => {
  console.log("Connected to Redis Client Successfully.");
});
connectDB();

const io = new SocketIO(server, {
  cors: true,
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors());

const ws = io.of("/ws");

ws.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers?.token;
  if (!token) next(new Error("Authentication error"));
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.user = decoded;
    next();
  });
});

// socket connections
ws.on("connection", (socket) => {
  console.log(
    `New user connected via socket: ${socket.user.user_data.phone_number} - ${socket.id}`
  );

  redisClient
    .set(socket.user.user_data.phone_number, socket.id)
    .catch((err) => {
      console.error("Failed to map phone_number to socket.id", err);
      socket.disconnect();
    });

  socket.on("message:create", (data, callback) => {
    console.log("new message arrived with data: ", data);
    const {
      message_id,
      message_mode,
      reply_id,
      fcm_token,
      message,
      caption,
      metadata: { avatar_url, phone_number, display_name },
    } = data;

    console.log([
      message_id,
      message_mode,
      message,
      avatar_url,
      phone_number,
      display_name,
    ]);

    if (
      [
        message_id,
        message_mode,
        message,
        avatar_url,
        phone_number,
        display_name,
      ].some((field) => field?.trim() === "")
    ) {
      return callback(new ApiError(400, "All fields are required."));
    }

    redisClient
      .get(phone_number)
      .then((value) => {
        console.log("redisClient", "phone_number", "available", value);
        if (value) {
          console.log("Sending message through socket server");
          ws.to(value).emit("message:recieved", {
            message_id,
            message_mode,
            reply_id: reply_id ?? "",
            _from: socket.user.user_data.phone_number,
            message,
            phone_number,
            display_name,
            caption: caption ?? "",
          });
          return callback(
            new ApiResponse(200, {
              message_id,
              status: "recieved",
            })
          );
        } else {
          if (!fcm_token || fcm_token.trim() === "")
            return callback(new ApiError(400, "fcm_token not found."));
          console.log("Sending message through firebase messaging");
          const fcm_message = {
            data: {
              message_id,
              message_mode,
              reply_id: reply_id ?? "",
              _from: socket.user.user_data.phone_number,
              message,
              avatar_url,
              phone_number,
              display_name,
              caption: caption ?? "",
            },
            token: fcm_token,
            notification: {
              title: display_name,
              body: message,
            },
            android: {
              priority: 'high',
              notification: {
                imageUrl: avatar_url,
                color: "#FBC508",
              },
            },
            apns: {
              payload: {
                aps: {
                  "mutable-content": 1,
                  'content-available': 1,
                },
              },
              fcm_options: {
                image: avatar_url,
              },
            },
            webpush: {
              headers: {
                image: avatar_url,
              },
            },
          };
          getMessaging(firebaseApp)
            .send(fcm_message)
            .then(() => {
              return callback(
                new ApiResponse(200, {
                  message_id,
                  status: "recieved",
                })
              );
            })
            .catch((err) => {
              console.error(err);
              return callback(
                new ApiResponse(
                  400,
                  {
                    message_id,
                    status: "failed",
                  },
                  "Failed to send message"
                )
              );
            });
        }
      })
      .catch((err) => {
        if (err.code === "messaging/registration-token-not-registered") {
          console.error("Failed to send FCM message:", err.message);
          return callback(
            new ApiResponse(
              400,
              {
                message_id,
                status: "failed",
              },
              "Failed to send message"
            )
          );
        }
      });
  });

  socket.on("disconnect", async () => {
    console.log(
      `user disconnected with pn: ${socket.user.user_data.phone_number} & socket id: ${socket.id}`
    );
    await redisClient.del(socket.user.user_data.phone_number);
  });
});

app.get("/", (_, res) => {
  res.status(200).json(new ApiResponse(200, null, "Success"));
});

// routes import
import userRouter from "./routes/public/user.routes.js";
import contactsRouter from "./routes/public/contacts.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

// Router
app.use("/api/v1/user", userRouter);
app.use("/api/v1/contacts", contactsRouter);
// app.use(errorHandler)

server.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));
