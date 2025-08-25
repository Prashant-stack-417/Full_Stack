import { useState } from "react";

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  // using localStorage as a simple user store: { username: { displayName } }
  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem("users") || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) return;

    const users = loadUsers();
    if (mode === "signup") {
      if (users[username]) {
        alert("Username taken");
        return;
      }
      users[username] = { displayName: displayName || username };
      saveUsers(users);
    } else {
      if (!users[username]) {
        alert("No such user. Please sign up first.");
        return;
      }
    }

    onLogin({
      username,
      displayName:
        (loadUsers()[username] && loadUsers()[username].displayName) ||
        displayName ||
        username,
    });
  }

  return (
    <div className="auth">
      <h2>{mode === "login" ? "Login" : "Sign up"}</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        {mode === "signup" && (
          <label>
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>
        )}
        <div className="auth-actions">
          <button type="submit">
            {mode === "login" ? "Login" : "Create account"}
          </button>
          <button
            type="button"
            className="link"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Create an account" : "Have an account? Login"}
          </button>
        </div>
      </form>
      <p className="muted small">
        This demo stores users & chats in your browser localStorage.
      </p>
    </div>
  );
}

export default Auth;
