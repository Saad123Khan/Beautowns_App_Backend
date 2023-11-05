import _ from 'lodash'
import {Server} from "socket.io";

class SocketServer {
    constructor(server, config = {}) {
        const io = new Server(server, config);
        this.socket = io
            .on("connection", async socket => {
                console.log(`SOCKET ID: ${socket.id} Connected`)
                socket.on("disconnect", () => {
                    console.log(`SOCKET ID: ${socket.id} Disconnected`)
                })
            })
    }
      sendVerificationSuccess(userData) {
        this.socket.emit("verificationSuccess", userData);
      }
      sendNotificationSucess(notData) {
        this.socket.emit("notification", notData);
      }
      sendNotificationAdminSucess(notData) {
        this.socket.emit("notification-admin", notData);
      }
      sendSessionExpired(notData) {
        this.socket.emit("sessionExpired", notData);
      }
      
};


export default SocketServer
