const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pract18";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("connected to mongodb"))
  .catch((e) => console.error(e));

const noteSchema = new mongoose.Schema(
  { title: String, body: String, tags: [String] },
  { timestamps: true }
);
const Note = mongoose.model("Note", noteSchema);

app.get("/api/notes", async (req, res) => {
  res.json(await Note.find().sort({ createdAt: -1 }));
});
app.post("/api/notes", async (req, res) => {
  const n = await Note.create(req.body);
  res.json(n);
});
app.put("/api/notes/:id", async (req, res) => {
  const n = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(n);
});
app.delete("/api/notes/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

app.use("/", express.static(path.join(__dirname, "../frontend")));

app.listen(PORT, () =>
  console.log(`Pract-18 backend on http://localhost:${PORT}`)
);
