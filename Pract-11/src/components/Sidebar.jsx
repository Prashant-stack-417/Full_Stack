import { useEffect, useState } from "react";
import ChatListItem from "./ChatListItem";
import { userAPI } from "../services/api";

function Sidebar({
  currentUser,
  onSelectUser,
  onLogout,
  activeUser,
  isMobile,
}) {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const users = await userAPI.getAllUsers();
        // Filter out current user
        const filteredContacts = users.filter(
          (user) => user._id !== currentUser._id
        );
        setContacts(filteredContacts);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser._id]);

  function startChatWith(u) {
    onSelectUser(u);
  }

  return (
    <aside
      className={`${
        isMobile
          ? "h-full p-4"
          : "rounded-2xl shadow-2xl border border-white/20 p-6"
      } bg-white/5 backdrop-blur-xl flex flex-col`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
            {(currentUser.displayName || currentUser.username)[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-white truncate text-sm sm:text-base">
              {currentUser.displayName || currentUser.username}
            </div>
            <div className="text-xs sm:text-sm text-slate-400 truncate">
              @{currentUser.username}
            </div>
          </div>
        </div>
        <button
          className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 flex-shrink-0"
          onClick={onLogout}
          title="Logout"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          placeholder="Search contacts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Contacts
        </h3>
        <div className="h-px bg-gradient-to-r from-purple-500/50 to-pink-500/50 mt-2"></div>
      </div>

      <div className="flex-1 overflow-auto space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Loading contacts...</p>
          </div>
        ) : (
          <>
            {contacts
              .filter(
                (c) =>
                  c.displayName.toLowerCase().includes(query.toLowerCase()) ||
                  c.username.toLowerCase().includes(query.toLowerCase())
              )
              .map((c) => (
                <ChatListItem
                  key={c._id}
                  contact={c}
                  onClick={() => startChatWith(c)}
                  isActive={activeUser?._id === c._id}
                />
              ))}
            {contacts.length === 0 && !loading && (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 text-slate-500 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-sm text-slate-400">No contacts yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Create other users to start chatting
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
