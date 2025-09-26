const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Simple in-memory session store: Map<sessionId, { name, loginAt }>
const sessions = new Map();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper to set cookie (minimal, not using cookie-parser)
function setSessionCookie(res, sid) {
  // HttpOnly, Path=/, Expires in 1 day
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
  res.setHeader(
    "Set-Cookie",
    `SID=${sid}; HttpOnly; Path=/; Expires=${expires}`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `SID=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  );
}

// Create session
app.post("/login", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  const sid = crypto.randomBytes(16).toString("hex");
  const session = { name: name.trim(), loginAt: new Date().toISOString() };
  sessions.set(sid, session);
  setSessionCookie(res, sid);
  return res.json({ ok: true });
});

// Read session
app.get("/session", (req, res) => {
  const cookies = (req.headers.cookie || "").split(";").map((s) => s.trim());
  const sidCookie = cookies.find((c) => c.startsWith("SID="));
  if (!sidCookie) return res.json({ session: null });
  const sid = sidCookie.split("=")[1];
  const session = sessions.get(sid) || null;
  return res.json({ session });
});

// Logout
app.post("/logout", (req, res) => {
  const cookies = (req.headers.cookie || "").split(";").map((s) => s.trim());
  const sidCookie = cookies.find((c) => c.startsWith("SID="));
  if (sidCookie) {
    const sid = sidCookie.split("=")[1];
    sessions.delete(sid);
  }
  clearSessionCookie(res);
  return res.json({ ok: true });
});

app.get("/debug/sessions", (req, res) => {
  // Not linked from UI; useful for debugging while developing
  const all = [];
  for (const [sid, s] of sessions.entries()) all.push({ sid, ...s });
  res.json({ count: all.length, sessions: all });
});

app.listen(PORT, () =>
  console.log(`Pract-15 session demo running on http://localhost:${PORT}`)
);
