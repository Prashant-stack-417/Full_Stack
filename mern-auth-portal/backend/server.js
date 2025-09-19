const path = require("path");
const dotenv = require("dotenv");
// Load environment variables from backend .env explicitly
dotenv.config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");
const errorHandler = require("./middleware/error");

const app = express();

// Configure CORS - allow FRONTEND_URL or multiple Vite dev origins
const corsOptions = {
  origin: process.env.FRONTEND_URL || [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
  ],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));

// Basic health route
app.get("/", (req, res) => {
  res.json({ message: "MERN Auth Portal API is running!" });
});

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendDist));

  // Serve index.html for all unknown routes (SPA)
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB then start server
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();

// Graceful error handling
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
