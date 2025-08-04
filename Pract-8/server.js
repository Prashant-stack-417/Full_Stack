import express from "express";
import path from "path";

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

app.get("/", async (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/public/index.html`));
});

app.listen(PORT, (req, res) => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
