const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.static("public"));

// Directory where log files are stored
const LOG_DIRECTORY = path.join(__dirname, "logs");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIRECTORY)) {
  fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
}

// Route to get list of all log files
app.get("/api/logs", (req, res) => {
  try {
    const files = fs.readdirSync(LOG_DIRECTORY);
    const logFiles = files.filter((file) => file.endsWith(".txt"));
    res.json({
      success: true,
      files: logFiles.map((file) => ({
        name: file,
        path: `/api/logs/${file}`,
      })),
    });
  } catch (error) {
    console.error("Error reading logs directory:", error);
    res.status(500).json({
      success: false,
      error: "Unable to read logs directory",
      message: error.message,
    });
  }
});

// Route to read a specific log file
app.get("/api/logs/:filename", (req, res) => {
  const filename = req.params.filename;

  // Basic security: only allow .txt files and prevent directory traversal
  if (
    !filename.endsWith(".txt") ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid filename",
      message: "Only .txt files are allowed and no directory traversal",
    });
  }

  const filePath = path.join(LOG_DIRECTORY, filename);

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File not found",
        message: `Log file '${filename}' does not exist`,
      });
    }

    // Get file stats for additional info
    const stats = fs.statSync(filePath);

    // Read file content
    const content = fs.readFileSync(filePath, "utf8");

    res.json({
      success: true,
      filename: filename,
      size: stats.size,
      lastModified: stats.mtime,
      content: content,
      lineCount: content.split("\n").length,
    });
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error);

    // Handle different types of errors
    if (error.code === "ENOENT") {
      res.status(404).json({
        success: false,
        error: "File not found",
        message: `Log file '${filename}' does not exist`,
      });
    } else if (error.code === "EACCES") {
      res.status(403).json({
        success: false,
        error: "Access denied",
        message: `Permission denied to read file '${filename}'`,
      });
    } else if (error.code === "EISDIR") {
      res.status(400).json({
        success: false,
        error: "Invalid file",
        message: `'${filename}' is a directory, not a file`,
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: `Unable to read file '${filename}': ${error.message}`,
      });
    }
  }
});

// Route to serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: "An unexpected error occurred",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not found",
    message: "The requested resource was not found",
  });
});

app.listen(PORT, () => {
  console.log(`Log Viewer Server is running on http://localhost:${PORT}`);
  console.log(`Log files directory: ${LOG_DIRECTORY}`);
});

module.exports = app;
