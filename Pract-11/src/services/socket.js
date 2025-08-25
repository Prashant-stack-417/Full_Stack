import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io("http://localhost:5000", {
      autoConnect: false,
    });

    this.socket.connect();

    this.socket.on("connect", () => {
      console.log("Connected to server");
      this.isConnected = true;
      this.socket.emit("user-online", userId);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Message methods
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit("send-message", messageData);
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on("receive-message", callback);
    }
  }

  // Typing methods
  sendTyping(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing", data);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user-typing", callback);
    }
  }

  // User status methods
  onUserStatus(callback) {
    if (this.socket) {
      this.socket.on("user-status", callback);
    }
  }

  // Clean up listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const socketService = new SocketService();
export default socketService;
