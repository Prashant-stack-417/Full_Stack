import { useEffect, useRef, useState } from "react";
import { messageAPI } from "../services/api";
import socketService from "../services/socket";

function ChatWindow({ currentUser, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    // Connect socket when component mounts
    socketService.connect(currentUser._id);

    // Listen for new messages
    socketService.onReceiveMessage((message) => {
      // Only add message if it's for this conversation
      if (
        message.sender === otherUser._id ||
        message.sender === currentUser._id
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [currentUser._id, otherUser._id]);

  useEffect(() => {
    // Fetch messages when users change
    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Get messages directly between two users
        const msgs = await messageAPI.getMessages(otherUser._id);
        setMessages(msgs);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentUser._id, otherUser._id]);

  useEffect(() => {
    // scroll to bottom
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;

    try {
      const message = await messageAPI.sendMessage({
        content: text.trim(),
        recipientId: otherUser._id,
      });

      // Add message locally
      setMessages((prev) => [...prev, message]);

      // Emit via socket for real-time delivery
      socketService.sendMessage({
        to: otherUser._id,
        from: currentUser._id,
        message: message.content,
        timestamp: message.createdAt,
      });

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 py-4 px-6 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {otherUser.displayName[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-white">
              {otherUser.displayName}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>@
              {otherUser.username}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4" ref={listRef}>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-slate-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isCurrentUser =
              (m.sender?._id || m.sender) === currentUser._id;

            return (
              <div
                key={m._id || i}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[80%] ${
                    isCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {isCurrentUser
                      ? (currentUser.displayName ||
                          currentUser.username)[0].toUpperCase()
                      : otherUser.displayName[0].toUpperCase()}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      isCurrentUser
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
                        : "bg-white/10 text-slate-100 rounded-bl-md"
                    } shadow-lg`}
                  >
                    <p className="break-words">{m.content}</p>
                    <div
                      className={`text-xs mt-2 ${
                        isCurrentUser ? "text-purple-100" : "text-slate-400"
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/10 bg-white/5">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder={`Message ${otherUser.displayName}...`}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors duration-200">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5.291A7.962 7.962 0 0112 21a7.962 7.962 0 01-5.291-1.709L3 21l1.709-3.709A7.962 7.962 0 013 12a8 8 0 018-8 8 8 0 018 8 7.962 7.962 0 01-1.709 5.291z"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={send}
            disabled={!text.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
