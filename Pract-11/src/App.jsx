import { useEffect, useState } from "react";
import "./App.css";
import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [user, setUser] = useState(null);
  const [activeUser, setActiveUser] = useState(null); // the user we're chatting with

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function handleLogin(loggedUser) {
    setUser(loggedUser);
    localStorage.setItem("currentUser", JSON.stringify(loggedUser));
  }

  function handleLogout() {
    setUser(null);
    setActiveUser(null);
    localStorage.removeItem("currentUser");
  }

  if (!user) {
    return (
      <div className="app-center">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <Sidebar
        currentUser={user}
        onSelectUser={(u) => setActiveUser(u)}
        onLogout={handleLogout}
      />
      <main className="chat-area">
        {activeUser ? (
          <ChatWindow currentUser={user} otherUser={activeUser} />
        ) : (
          <div className="placeholder">Select a contact to start chatting</div>
        )}
      </main>
      <aside className="right-panel">
        <div className="me">
          <strong>{user.username}</strong>
          <div className="small muted">You are online</div>
        </div>
      </aside>
    </div>
  );
}

export default App;
