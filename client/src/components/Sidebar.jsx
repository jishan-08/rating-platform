import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Sidebar({ open, onNavigate }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Role-specific navigation items
    const getNavItems = () => {
        const baseItems = [{ label: "Overview", to: "/dashboard" }];

        if (user?.role === "ADMIN") {
            baseItems.push({ label: "Admin Panel", to: "/dashboard#admin" });
        } else if (user?.role === "STORE_OWNER") {
            baseItems.push({ label: "My Stores", to: "/dashboard#store-owner" });
        } else {
            baseItems.push({ label: "Browse Stores", to: "/dashboard#browse" });
            baseItems.push({ label: "My Ratings", to: "/dashboard#my-ratings" });
        }

        return baseItems;
    };

    const items = getNavItems();

    return (
        <aside className={`sidebar ${open ? "sidebar--open" : ""}`} aria-label="Dashboard navigation">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                    <p className="sidebar-label">Workspace</p>
                    <nav>
                        {items.map((item) => (
                            <NavLink key={item.label} to={item.to} end={item.to === "/dashboard"} onClick={onNavigate}>
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "1rem", marginTop: "2rem" }}>
                    <div style={{ marginBottom: "0.75rem", padding: "0 0.75rem" }}>
                        <p style={{ margin: 0, fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>{user?.name}</p>
                        <p style={{ margin: 0, color: "#aac1c4", fontSize: "0.78rem" }}>{user?.email}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "transparent",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "0.88rem",
                            textAlign: "left",
                        }}
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
