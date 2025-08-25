import { useEffect, useState } from "react";
import ChatListItem from "./ChatListItem";

function Sidebar({ currentUser, onSelectUser, onLogout }) {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "{}");
    const list = Object.keys(users)
      .filter((u) => u !== currentUser.username)
      .map((u) => ({ username: u, displayName: users[u].displayName }));
    setContacts(list);
  }, [currentUser.username]);

  function startChatWith(u) {
    onSelectUser(u);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div>
          <strong>{currentUser.displayName}</strong>
          <div className="small muted">@{currentUser.username}</div>
        </div>
        <div>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="search">
        <input
          placeholder="Search contacts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="contacts">
        {contacts
          .filter(
            (c) =>
              c.displayName.toLowerCase().includes(query.toLowerCase()) ||
              c.username.toLowerCase().includes(query.toLowerCase())
          )
          .map((c) => (
            <ChatListItem
              key={c.username}
              contact={c}
              onClick={() => startChatWith(c)}
            />
          ))}
        {contacts.length === 0 && (
          <div className="muted small">
            No contacts yet. Create other users via Sign up.
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
