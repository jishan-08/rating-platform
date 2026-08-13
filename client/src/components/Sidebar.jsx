import { NavLink } from "react-router-dom";

const items = [
    { label: "Overview", to: "/dashboard" },
    { label: "Admin", to: "/dashboard#admin" },
    { label: "My ratings", to: "/dashboard#user" },
    { label: "Store owner", to: "/dashboard#store-owner" },
];

function Sidebar({ open, onNavigate }) {
    return (
        <aside className={`sidebar ${open ? "sidebar--open" : ""}`} aria-label="Dashboard navigation">
            <p className="sidebar-label">Workspace</p>
            <nav>
                {items.map((item) => (
                    <NavLink key={item.label} to={item.to} end={item.to === "/dashboard"} onClick={onNavigate}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
