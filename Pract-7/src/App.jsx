import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100 items-center-safe justify-center h-screen w-screen">
        <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <button
            className="fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-lg hover:bg-gray-100"
            onClick={toggleSidebar}
          >
            ☰
          </button>
          <div className="p-8 text-black flex items-center justify-center">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
