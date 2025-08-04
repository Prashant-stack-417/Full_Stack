import React from "react";

const Messages = () => {
  return (
    <div className="page messages-page">
      <h1>Messages</h1>
      <div className="messages-list">
        <div className="message-item">
          <img src="https://via.placeholder.com/40" alt="User" />
          <div className="message-content">
            <h3>Jane Smith</h3>
            <p>Hello! How are you?</p>
          </div>
        </div>
        <div className="message-item">
          <img src="https://via.placeholder.com/40" alt="User" />
          <div className="message-content">
            <h3>Mike Johnson</h3>
            <p>Meeting at 3 PM?</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
