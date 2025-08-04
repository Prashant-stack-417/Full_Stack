import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express(); // Initialize Express app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Ensure data.json exists with initial value
const dataFilePath = path.join(__dirname, "data.json");
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify({ counter: 0 }));
}

// Update counter endpoint
app.post("/updateCounter", (req, res) => {
  try {
    const newCount = req.body.counter;
    if (typeof newCount !== "number") {
      return res.status(400).json({ error: "Invalid counter value" });
    }

    const data = { counter: newCount };
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.json({ success: true, counter: newCount });
  } catch (error) {
    console.error("Error updating counter:", error);
    res.status(500).json({ error: "Failed to update counter" });
  }
});

// Get counter endpoint
app.get("/getCounter", (req, res) => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return res.json({ counter: 0 });
    }
    const data = JSON.parse(fs.readFileSync(dataFilePath));
    res.json(data);
  } catch (error) {
    console.error("Error reading counter:", error);
    res.status(500).json({ error: "Failed to read counter" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
