import { useState } from "react";
import { authAPI } from "../services/api";

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      let response;
      if (mode === "signup") {
        if (!displayName.trim()) {
          setError("Display name is required for registration");
          setLoading(false);
          return;
        }
        response = await authAPI.register({
          username: username.trim(),
          displayName: displayName.trim(),
          password,
        });
      } else {
        response = await authAPI.login({
          username: username.trim(),
          password,
        });
      }

      // Store token and user data
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("currentUser", JSON.stringify(response.user));

      onLogin(response.user);
    } catch (error) {
      console.error("Auth error:", error);
      setError(
        error.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-4 sm:mx-0 sm:w-[480px] bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/20 shadow-2xl">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {mode === "login" ? "Welcome Back" : "Join Us"}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base">
          {mode === "login" ? "Sign in to your account" : "Create your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Username
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            disabled={loading}
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Display Name
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should others see you?"
              disabled={loading}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <button
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>
                {mode === "login" ? "Signing In..." : "Creating Account..."}
              </span>
            </div>
          ) : mode === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-slate-300 hover:text-white transition-colors duration-200"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <span className="text-purple-400 font-semibold">Sign up</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span className="text-purple-400 font-semibold">Sign in</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400 mt-6 text-center">
        Connected to MongoDB database for user authentication and data storage.
      </p>
    </div>
  );
}

export default Auth;
