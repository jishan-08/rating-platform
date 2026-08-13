import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
            {sidebarOpen && <button className="sidebar-overlay" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    <button className="menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>Menu</button>
                    <Link className="brand brand--compact" to="/">Rating Platform</Link>
                    <span className="role-chip">Dashboard preview</span>
                </header>
                <main className="dashboard-content"><Outlet /></main>
            </div>
        </div>
    );
}

export default DashboardLayout;
