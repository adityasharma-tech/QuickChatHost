import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import { Server as SocketIO } from "socket.io";
import jwt from "jsonwebtoken";
import { createClient as createRedisClient } from "redis";
import { ApiResponse } from "./utils/ApiResponse.js";
import serviceAccount from "./config/fbadmin.creds.json" assert { type: "json" };
import { ApiError } from "./utils/ApiError.js";
import { getMessaging } from "firebase-admin/messaging";

import { PORT } from "./lib/constants.js";
import connectDB from "./lib/db.js";

dotenv.config({ path: "./.env" });

const app = express();
const server = http.createServer(app);
const redisClient = createRedisClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
const firebaseApp = initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error: ", err);
  process.exit(1);
});

(async () => await redisClient.connect())();
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
    if (err) next(new Error("Authentication error"));
    socket.user = decoded;
    next();
  });
});

// socket connections
ws.on("connection", (socket) => {
  console.log(
    `New user connected via socket: ${socket.user.custom_data.phone_number} - ${socket.id}`
  );

  redisClient
    .set(socket.user.custom_data.phone_number, socket.id)
    .catch((err) => {
      console.error("Failed to map phone_number to socket.id", err);
      socket.disconnect();
    });

  socket.on("message:create", (data, callback) => {
    console.log("new message arrived with data: ", data, callback);
    const {
      message_id,
      message_mode,
      reply_id,
      fcm_token,
      message,
      caption,
      metadata: { avatar_url, phone_number, display_name },
    } = data;

    if (
      [
        message_id,
        message_mode,
        message,
        avatar_url,
        phone_number,
        display_name,
        caption,
      ].some((field) => field?.trim() === "")
    ) {
      return callback(new ApiError(400, "All fields are required."));
    }

    redisClient
      .get(phone_number)
      .then((value) => {
        if (value)
          ws.to(value).emit("message:recieved", {
            message_id,
            message_mode,
            reply_id: reply_id ?? "",
            message,
            phone_number,
            display_name,
            caption: caption ?? ""
          }).then(()=>{
            return callback(new ApiResponse(200, {
                message_id,
                status: "recieved"
            }));
          })
        else {
          if (!fcm_token || fcm_token.trim() === "") return callback(new ApiError(400, "fcm_token not found."));
          const fcm_message = {
            data: {
              message_id,
              message_mode,
              reply_id: reply_id ?? "",
              message,
              avatar_url,
              phone_number,
              display_name,
              caption: caption ?? ""
            },
            token: fcm_token,
            notification: {
              title: display_name,
              body: message,
            },
            android: {
              notification: {
                imageUrl: avatar_url,
                color: "#FBC508",
              },
            },
            apns: {
              payload: {
                aps: {
                  "mutable-content": 1,
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
          console.log(fcm_message.data);
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
                new ApiResponse(400, {
                  message_id,
                  status: "failed",
                }, "Failed to send message")
              );
            });
        }
      })
      .catch((err) => console.error(err));
  });

  socket.on("disconnect", async () => {
    console.log(
      `user disconnected with pn: ${socket.user.custom_data.phone_number} & socket id: ${socket.id}`
    );
    await redisClient.del(socket.user.custom_data.phone_number);
  });
});

app.get("/", (_, res) => {
  res.status(200).json(new ApiResponse(200, null, "Success"));
});

// routes import
import userRouter from "./routes/public/user.routes.js";

// Router
app.use("/api/v1/user", userRouter);

server.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));
