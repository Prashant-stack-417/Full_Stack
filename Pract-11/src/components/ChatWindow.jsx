import { useEffect, useRef, useState } from "react";

function ChatWindow({ currentUser, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  const chatId = [currentUser.username, otherUser.username].sort().join("::");

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("chats") || "{}");
    setMessages(all[chatId] || []);
  }, [chatId]);

  useEffect(() => {
    // scroll to bottom
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  function send() {
    if (!text.trim()) return;
    const msg = {
      from: currentUser.username,
      to: otherUser.username,
      text: text.trim(),
      ts: Date.now(),
    };
    const all = JSON.parse(localStorage.getItem("chats") || "{}");
    const chat = all[chatId] || [];
    const updated = [...chat, msg];
    all[chatId] = updated;
    localStorage.setItem("chats", JSON.stringify(all));
    setMessages(updated);
    setText("");
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div>
          <strong>{otherUser.displayName}</strong>
          <div className="small muted">@{otherUser.username}</div>
        </div>
      </div>
      <div className="messages" ref={listRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${
              m.from === currentUser.username ? "me" : "them"
            }`}
          >
            <div className="bubble">{m.text}</div>
            <div className="ts small muted">
              {new Date(m.ts).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="composer">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${otherUser.displayName}`}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
