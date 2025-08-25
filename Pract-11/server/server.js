import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import messageRoutes from "./routes/messages.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp";

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// MongoDB connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Socket.IO for real-time messaging
const connectedUsers = new Map();

// Make io and connectedUsers available to routes
app.set("io", io);
app.set("connectedUsers", connectedUsers);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Chat App API Server" });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins
  socket.on("user-online", (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} is online`);

    // Notify other users
    socket.broadcast.emit("user-status", { userId, status: "online" });
  });

  // Send message
  socket.on("send-message", (messageData) => {
    const { to, from, message, timestamp } = messageData;
    const recipientSocketId = connectedUsers.get(to);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receive-message", {
        from,
        message,
        timestamp,
      });
    }
  });

  // User typing
  socket.on("typing", (data) => {
    const { to, from, isTyping } = data;
    const recipientSocketId = connectedUsers.get(to);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("user-typing", {
        from,
        isTyping,
      });
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        connectedUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      console.log(`User ${disconnectedUserId} disconnected`);
      socket.broadcast.emit("user-status", {
        userId: disconnectedUserId,
        status: "offline",
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for real-time connections`);
});
