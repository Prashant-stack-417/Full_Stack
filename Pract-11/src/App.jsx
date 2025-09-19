import { useEffect, useState } from "react";
import "./App.css";
import "./index.css";
import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { authAPI } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [activeUser, setActiveUser] = useState(null); // the user we're chatting with
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await authAPI.verifyToken();
          setUser(userData);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  function handleLogin(loggedUser) {
    setUser(loggedUser);
  }

  function handleLogout() {
    setUser(null);
    setActiveUser(null);
    localStorage.removeItem("token");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 h-screen w-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center h-screen w-screen">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-screen">
        {!activeUser ? (
          <Sidebar
            currentUser={user}
            onSelectUser={(u) => setActiveUser(u)}
            onLogout={handleLogout}
            activeUser={activeUser}
            isMobile={true}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-4 bg-white/10 border-b border-white/10">
              <button
                onClick={() => setActiveUser(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h1 className="text-white font-semibold">Back to Chats</h1>
            </div>
            <div className="flex-1">
              <ChatWindow currentUser={user} otherUser={activeUser} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-[320px_1fr] lg:grid-cols-[320px_1fr_280px] gap-6 p-6 h-screen">
        <Sidebar
          currentUser={user}
          onSelectUser={(u) => setActiveUser(u)}
          onLogout={handleLogout}
          activeUser={activeUser}
          isMobile={false}
        />
        <main className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {activeUser ? (
            <ChatWindow currentUser={user} otherUser={activeUser} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-white"
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
              <h3 className="text-xl font-semibold mb-2">
                Start a Conversation
              </h3>
              <p className="text-slate-400 text-center">
                Select a contact from the sidebar to begin chatting
              </p>
            </div>
          )}
        </main>
        {/* Right Panel - Hidden on tablet, shown on desktop */}
        <aside className="hidden lg:block bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
              {(user.displayName || user.username)[0].toUpperCase()}
            </div>
            <div className="font-semibold text-slate-100 mb-1">
              {user.displayName || user.username}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              Online
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
                Status
              </div>
              <div className="text-sm text-slate-200">Available for chat</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
