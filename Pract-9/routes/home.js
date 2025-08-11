const express = require("express");
const path = require("path");
const router = express.Router();

// Home route - serves the HTML page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// API route for welcome message
router.get("/api/welcome", (req, res) => {
  res.json({
    message: "Welcome to our site",
    status: "success",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
