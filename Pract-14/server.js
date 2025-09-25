const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config: store files in uploads with original filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // prevent path traversal and keep filename safe
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, Date.now() + "_" + safeName);
  },
});

// File filter: only accept PDFs
function fileFilter(req, file, cb) {
  const allowedMime = ["application/pdf"];
  const allowedExt = [".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Only PDF files are allowed"
      )
    );
  }
}

// 2MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

app.use(express.static(path.join(__dirname, "public")));

// Simple upload form (optional)
app.get("/", (req, res) => {
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Upload Resume</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <main class="page">
      <section class="card">
        <header class="card__header">
          <h1 class="title">Upload Resume</h1>
          <p class="subtitle">PDF only • Maximum 2MB</p>
        </header>

        <form class="upload-form" method="post" enctype="multipart/form-data" action="/upload">
          <label class="file-input">
            <input id="fileInput" type="file" name="resume" accept="application/pdf" required />
            <span class="file-input__label">Choose a PDF file</span>
          </label>

          <div id="file-info" class="file-input__meta" aria-live="polite">No file chosen</div>

          <div class="actions">
            <button id="uploadBtn" type="submit" class="btn">Upload</button>
          </div>
        </form>

        <div id="status" class="status" aria-live="polite" role="status" hidden></div>

        <p class="note">Tip: Make sure your resume is a PDF and under 2MB for faster processing.</p>
      </section>
    </main>
    <script src="/app.js" defer></script>
  </body>
</html>`);
});

// Upload endpoint
app.post("/upload", upload.single("resume"), (req, res) => {
  // If we reach here, multer accepted the file
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  res.json({
    success: true,
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
});

// Error handler for multer errors and others
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "File too large. Max size is 2MB." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json({ success: false, message: "Only PDF files are allowed." });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
