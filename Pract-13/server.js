const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: false })); // parse form body
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.render("form", {
    errors: null,
    values: { source1: "", source2: "" },
    total: null,
  });
});

app.post("/calculate", (req, res) => {
  const { source1, source2 } = req.body;
  const errors = {};
  const values = { source1: source1 || "", source2: source2 || "" };

  // Validation: required and numeric (allow decimals, commas trimmed)
  function parseNumber(input) {
    if (typeof input !== "string") return NaN;
    const normalized = input.replace(/,/g, "").trim();
    if (normalized === "") return NaN;
    return Number(normalized);
  }

  const a = parseNumber(source1);
  const b = parseNumber(source2);

  if (Number.isNaN(a))
    errors.source1 = "Please enter a valid number for Income Source 1.";
  if (Number.isNaN(b))
    errors.source2 = "Please enter a valid number for Income Source 2.";

  if (Object.keys(errors).length > 0) {
    return res.status(400).render("form", { errors, values, total: null });
  }

  const total = a + b;
  res.render("form", { errors: null, values, total });
});

app.listen(port, () => {
  console.log(`Tax form app listening on http://localhost:${port}`);
});
