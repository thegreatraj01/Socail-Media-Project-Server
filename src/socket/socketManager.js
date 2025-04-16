import { Server, Socket } from "socket.io";
import { handlePublicChat } from "../controllers/socket.controller.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  // 2. Basic connection handler
  io.on("connection", (socket) => {
    console.log("Client connected");

    // Event handlers
    handlePublicChat(io, socket);

    // 3. Essential disconnect handler
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};
