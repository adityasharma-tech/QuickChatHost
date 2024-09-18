import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { Server as SocketIO } from "socket.io";

import { PORT } from "./lib/constants.js"
import connectDB from "./lib/db.js";

dotenv.config({ path: "./.env" });

const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors());


// const io = new SocketIO(server, {
//   cors: true,
// });


// io.on("connection", (socket) => {
//   socket.on("user:join", (data) => {
//     console.warn(
//       "user:join",
//       "New user joined with socket.id ",
//       socket.id,
//       " data: ",
//       data
//     );
//   });
// });

app.get('/', (_, res)=>{
    res.status(200).json(
        new ApiResponse(200, null, "Success"),
    )
})

// routes import
import userRouter from './routes/public/user.routes.js'
import { ApiResponse } from "./utils/ApiResponse.js";

// Router
app.use('/api/v1/user', userRouter);

connectDB();
server.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));
