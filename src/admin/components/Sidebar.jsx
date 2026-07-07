import {
  LayoutDashboard, ShoppingBag, FolderTree, Package,
  Users, Heart, Image, BarChart3, Settings, LogOut, X, MessageSquare
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menus = [
  { name: "Dashboard",        path: "/admin-dashboard",            icon: <LayoutDashboard size={20} /> },
  { name: "Products",         path: "/admin-dashboard/products",   icon: <ShoppingBag size={20} /> },
  { name: "Categories",       path: "/admin-dashboard/categories", icon: <FolderTree size={20} /> },
  { name: "Orders",           path: "/admin-dashboard/orders",     icon: <Package size={20} /> },
  { name: "Customers",        path: "/admin-dashboard/customers",  icon: <Users size={20} /> },
  { name: "Wishlist",         path: "/admin-dashboard/wishlist",   icon: <Heart size={20} /> },
  { name: "Banner",           path: "/admin-dashboard/banner",     icon: <Image size={20} /> },
  { name: "Analytics",        path: "/admin-dashboard/analytics",  icon: <BarChart3 size={20} /> },
  { name: "Support Messages", path: "/admin-dashboard/support",    icon: <MessageSquare size={20} /> },
  { name: "Settings",         path: "/admin-dashboard/settings",   icon: <Settings size={20} /> },
];

export default function Sidebar({ logout, sidebarOpen, setSidebarOpen }) {
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
          <h1 className="sidebar-logo-text">NOVEMBER</h1>
          <span className="sidebar-logo-sub">MENSWEAR</span>
          <span className="sidebar-logo-short" style={{ display: "none" }}>N</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {menus.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin-dashboard"}
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