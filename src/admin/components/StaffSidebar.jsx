import {
  LayoutDashboard, Package, Users, BarChart3, LogOut, X
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menus = [
  { name: "Dashboard", path: "/staff-dashboard",           icon: <LayoutDashboard size={20} /> },
  { name: "Orders",    path: "/staff-dashboard/orders",    icon: <Package size={20} /> },
  { name: "Customers", path: "/staff-dashboard/customers", icon: <Users size={20} /> },
  { name: "Analytics", path: "/staff-dashboard/analytics", icon: <BarChart3 size={20} /> },
];

export default function StaffSidebar({ logout, sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
      <div>
        {/* Mobile Close Button */}
        <button 
          className="sidebar-close-btn" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="sidebar-logo-wrap">
          <h1 className="sidebar-logo-text">THE NOVEMBER</h1>
          <span className="sidebar-logo-sub">MENSWEAR</span>
          <span className="sidebar-logo-short" style={{ display: "none" }}>N</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {menus.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/staff-dashboard"}
              className="sidebar-nav-link"
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <button onClick={logout} className="sidebar-logout-btn">
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
