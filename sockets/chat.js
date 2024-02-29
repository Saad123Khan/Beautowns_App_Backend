// chat.js
import { Chat } from "#models/chat_model";
class ChatHandler {
  constructor(socketServer) {
    this.socketServer = socketServer;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socketServer.socket.on("connection", (socket) => {
      console.log(`SOCKET ID: ${socket.id} Connected chat`);

      socket.on("joinRoom", (room) => {
        console.log(`SOCKET ID: ${socket.id} Joined room: ${room}`);
        socket.join(room);
      });

      socket.on("sendMessage", (data) => {
        console.log("data", data);
        this.socketServer.socket.to(data.room).emit("receiveMessage", data);
      });

      socket.on("disconnect", () => {
        console.log(`SOCKET ID: ${socket.id} Disconnected chat`);
      });
    });
  }

  // Additional chat-related methods can be added here
  sendMessage(room, message) {
    this.socketServer.sendMessage({
      room,
      message,
    });
  }
}

export default ChatHandler;
