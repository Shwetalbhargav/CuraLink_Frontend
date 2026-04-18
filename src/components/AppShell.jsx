import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/chat", label: "Chat" },
  { to: "/literature", label: "Library Discovery" },
  { to: "/clinical-trials", label: "Clinical Trials" },
  { to: "/synthesis", label: "Deep Synthesis" },
  { to: "/library", label: "Research Library" },
  { to: "/support", label: "Support" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-kicker">CuraLink</span>
          <h1>Clinical Precision</h1>
          <p>Evidence-backed medical research workspace.</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "nav-item nav-item-active" : "nav-item"}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Precision Lab V1</span>
            <h2>AI Medical Research Assistant</h2>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button">Notifications</button>
            <button className="primary-button">New Analysis</button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

