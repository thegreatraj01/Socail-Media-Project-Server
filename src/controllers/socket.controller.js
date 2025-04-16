export const handlePublicChat = (io, socket) => {
  // Handle messages
  socket.on("chatMessage", (msg) => {
    socket.broadcast.emit("chatMessage", msg);
  });

  // Only emit when someone is typing
  socket.on("typing", () => {
    socket.broadcast.emit("typing");
  });
};
