import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Views", "Public")));

// Route to serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Views", "Index.html"));
});

app.post("/Calculate", (req, res) => {
  const { num1, num2, operation } = req.body;

  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send(`
      <html>
      <head>
          <title>Error - Kids Calculator</title>
          <link rel="stylesheet" href="../Public/styles.css">
      </head>
      <body>
          <div class="container">
              <div class="result-card error">
                  <h2>❌ Error: Please enter valid numbers.</h2>
                  <a href="/" class="try-again-btn">🔄 Try Again</a>
              </div>
          </div>
      </body>
      </html>
    `);
  }

  let result;
  switch (operation) {
    case "add":
      result = parseFloat(num1) + parseFloat(num2);
      break;
    case "subtract":
      result = parseFloat(num1) - parseFloat(num2);
      break;
    case "multiply":
      result = parseFloat(num1) * parseFloat(num2);
      break;
    case "divide":
      result = parseFloat(num1) / parseFloat(num2);
      break;
    default:
      return res.status(400).send(`
        <html>
        <head>
            <title>Error - Kids Calculator</title>
            <link rel="stylesheet" href="../Public/styles.css">
        </head>
        <body>
            <div class="container">
                <div class="result-card error">
                    <h2>❌ Invalid operation</h2>
                    <a href="/" class="try-again-btn">🔄 Try Again</a>
                </div>
            </div>
        </body>
        </html>
      `);
  }

  res.send(`
    <html>
    <head>
        <title>Result - Kids Calculator</title>
        <link rel="stylesheet" href="../Public/styles.css">
    </head>
    <body>
        <div class="container">
            <div class="result-card success">
                <h2>🎉 Result: ${result}</h2>
                <a href="/" class="try-again-btn">🔄 Try Again</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
