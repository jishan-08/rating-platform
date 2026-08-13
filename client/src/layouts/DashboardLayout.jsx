import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/useAuth";
import Button from "../components/Button";

function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-layout">
            <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
            {sidebarOpen && (
                <button
                    className="sidebar-overlay"
                    aria-label="Close navigation"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <button
                            className="menu-button"
                            aria-label="Open navigation"
                            onClick={() => setSidebarOpen(true)}
                        >
                            Menu
                        </button>
                        <Link className="brand brand--compact" to="/">
                            <span className="brand-mark" aria-hidden="true">R</span>
                            <span>Rating Platform</span>
                        </Link>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span className="role-chip">
                            {user?.role ? `${user.role}` : "Authenticated"}
                        </span>
                        <Button variant="secondary" onClick={handleLogout} style={{ padding: "0.4rem 0.8rem", minHeight: "36px", fontSize: "0.85rem" }}>
                            Logout
                        </Button>
                    </div>
                </header>
                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
