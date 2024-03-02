// chatHandler.js
import { saveMessage, getMessages } from "#controllers/chat.controller";

class ChatHandler {
  constructor(socketServer) {
    this.io = socketServer.socket; // Access the io instance directly
    this.io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on(
        "sendMessage",
        async ({ message, sender_Id, receiver_Id }, callback) => {
          try {
            await saveMessage(
              { body: { sender_Id, receiver_Id, message } },
              null
            );

         
            const previousMessages = await getMessages(
              { body: { sender_Id, receiver_Id } },
              null
            );

            this.io.emit("receiveMessage", {
              senderId: socket.id,
              previousMessages: previousMessages,
            });

            // Emit "receiveMessage" event to the receiver
            if (receiver_Id) {
              this.io.to(receiver_Id).emit("receiveMessage", {
                senderId: socket.id,
                previousMessages: previousMessages,
              });
            }

            if (callback && typeof callback === "function") {
              callback({
                status: "Message sent successfully",
                previousMessages,
              });
            }
          } catch (error) {
            console.log("Error saving or retrieving messages:", error);
            // Handle error and send an appropriate acknowledgment
            if (callback && typeof callback === "function") {
              callback({ status: "Error saving or retrieving messages" });
            }
          }
        }
      );

      socket.on("sendHistory", async ({ sender_Id, receiver_Id }, callback) => {
        console.log(sender_Id, receiver_Id, "sender_Id, receiver_Id");
        try {
          //   let previousMessages;
          const previousMessages = await getMessages(
            { body: { sender_Id, receiver_Id } },
            null
          );

          // console.log(previousMessages,"previousMessages")
          if (receiver_Id) {
            this.io.to(receiver_Id).emit("receiveMessage", {
              senderId: socket.id,
              previousMessages: previousMessages,
            });
          }

          if (callback && typeof callback === "function") {
            callback({ status: "Message sent successfully", previousMessages });
          }
        } catch (error) {
          console.log("Error saving or retrieving messages:", error);
          // Handle error and send an appropriate acknowledgment
          if (callback && typeof callback === "function") {
            callback({ status: "Error saving or retrieving messages" });
          }
        }
      });

      // Handle disconnect event
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  sendDemoMessage(socketId, message) {
    this.io.to(socketId).emit("receiveDemoMessage", {
      message: `This is a demo message from the server to ${socketId}: ${message}`,
    });
  }

  // ... other methods ...
}

export default ChatHandler;
