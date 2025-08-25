import express from "express";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get conversations for current user
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.userId,
    })
      .populate("participants", "username displayName avatar isOnline lastSeen")
      .populate("lastMessage")
      .sort({ lastActivity: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get messages between two users
router.get("/:recipientId", authenticateToken, async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, recipient: recipientId },
        { sender: recipientId, recipient: req.user.userId },
      ],
    })
      .populate("sender", "username displayName avatar")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        sender: recipientId,
        recipient: req.user.userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Send a message
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { recipientId, content, messageType = "text" } = req.body;

    if (!recipientId || !content) {
      return res
        .status(400)
        .json({ error: "Recipient and content are required" });
    }

    // Create message
    const message = new Message({
      sender: req.user.userId,
      recipient: recipientId,
      content,
      messageType,
      isDelivered: true,
      deliveredAt: new Date(),
    });

    await message.save();
    await message.populate("sender", "username displayName avatar");

    // Update or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.userId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.userId, recipientId],
        lastMessage: message._id,
        lastActivity: new Date(),
      });
    } else {
      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();
    }

    await conversation.save();

    // Emit message via Socket.IO for real-time delivery
    const io = req.app.get("io");
    const connectedUsers = req.app.get("connectedUsers");

    if (io && connectedUsers) {
      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receive-message", message);
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark message as read
router.put("/:messageId/read", authenticateToken, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: req.params.messageId,
        recipient: req.user.userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ message: "Message marked as read" });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get unread message count
router.get("/unread/count", authenticateToken, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.userId,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
