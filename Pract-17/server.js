const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Student = require("./models/student");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pract17";

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API: CRUD for students
app.get("/api/students", async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
});

app.post("/api/students", async (req, res) => {
  const { name, age, phone, course } = req.body;
  if (!name || !name.trim())
    return res.status(400).json({ error: "Name is required" });
  try {
    const s = await Student.create({ name: name.trim(), age, phone, course });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: "Failed to create student" });
  }
});

app.put("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const s = await Student.findByIdAndUpdate(id, req.body, { new: true });
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: "Failed to update student" });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const s = await Student.findByIdAndDelete(id);
    if (!s) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

app.listen(PORT, () =>
  console.log(`Pract-17 tuition admin running on http://localhost:${PORT}`)
);
