import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:5174").split(",").map(o => o.trim()),
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; 

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("register_user", (userId) => {
    if (userId !== "undefined") {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

export { app, io, server };
