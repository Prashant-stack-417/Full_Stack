function ChatListItem({ contact, onClick }) {
  return (
    <div className="chat-list-item" onClick={onClick}>
      <div className="avatar">
        {contact.displayName ? contact.displayName[0].toUpperCase() : "?"}
      </div>
      <div className="meta">
        <div className="name">{contact.displayName}</div>
        <div className="small muted">@{contact.username}</div>
      </div>
    </div>
  );
}

export default ChatListItem;
