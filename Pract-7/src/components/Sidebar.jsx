import { Link } from "react-router-dom";

const Sidebar = ({ isOpen, toggle }) => {
  const menuItems = [
    { title: "Home", icon: "🏠", path: "/" },
    { title: "Profile", icon: "👤", path: "/profile" },
    { title: "Messages", icon: "✉️", path: "/messages" },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>Menu</h2>
        <button className="close-btn" onClick={toggle}>
          ×
        </button>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="menu-item"
            onClick={toggle}
          >
            <span className="icon">{item.icon}</span>
            <span className="title">{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
