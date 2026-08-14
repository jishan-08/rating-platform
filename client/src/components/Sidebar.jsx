import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Sidebar({ open, onNavigate }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Role-specific navigation items
    const getNavItems = () => {
        if (user?.role === "ADMIN") {
            return [
                { label: "Dashboard", to: "/admin" },
                { label: "Users", to: "/admin#users" },
                { label: "Stores", to: "/admin#stores" },
            ];
        }

        if (user?.role === "STORE_OWNER") {
            return [
                { label: "Dashboard", to: "/dashboard" },
                { label: "My Store", to: "/dashboard#my-store" },
                { label: "Ratings", to: "/dashboard#ratings" },
            ];
        }

        return [
            { label: "Overview", to: "/dashboard" },
            { label: "Browse Stores", to: "/dashboard#browse" },
            { label: "My Ratings", to: "/dashboard#my-ratings" },
        ];
    };

    const items = getNavItems();

    const isItemActive = (itemTo) => {
        if (itemTo === "/admin") {
            return (
                (location.pathname === "/admin" || location.pathname === "/admin/dashboard") &&
                (!location.hash || location.hash === "#dashboard")
            );
        }
        if (itemTo === "/admin#users") {
            return location.hash === "#users" || location.pathname === "/admin/users";
        }
        if (itemTo === "/admin#stores") {
            return location.hash === "#stores" || location.pathname === "/admin/stores";
        }
        if (itemTo === "/dashboard") {
            if (user?.role === "STORE_OWNER") {
                return location.pathname === "/dashboard" && (!location.hash || location.hash === "#dashboard");
            }
            return location.pathname === "/dashboard" && (!location.hash || location.hash === "#overview" || location.hash === "#browse");
        }
        if (itemTo.includes("#")) {
            const [itemPath, itemHash] = itemTo.split("#");
            const expectedHash = `#${itemHash}`;
            return location.pathname === itemPath && location.hash === expectedHash;
        }
        return location.pathname === itemTo;
    };

    return (
        <aside className={`sidebar ${open ? "sidebar--open" : ""}`} aria-label="Dashboard navigation">
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                    <p className="sidebar-label">Workspace</p>
                    <nav>
                        {items.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                className={isItemActive(item.to) ? "active" : ""}
                                onClick={onNavigate}
                            >
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
