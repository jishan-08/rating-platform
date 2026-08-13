import { Link, NavLink, useNavigate } from "react-router-dom";
import Button from "./Button";
import { useAuth } from "../context/useAuth";

function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="site-header">
            <nav className="page-container nav" aria-label="Main navigation">
                <Link className="brand" to="/" aria-label="Rating Platform home">
                    <span className="brand-mark" aria-hidden="true">R</span>
                    <span>Rating Platform</span>
                </Link>
                <div className="nav-links">
                    <NavLink to="/" end>Home</NavLink>

                    {isAuthenticated ? (
                        <>
                            <NavLink to="/dashboard">Dashboard</NavLink>
                            <span className="role-chip" title={`Logged in as ${user?.role}`}>
                                {user?.name ? user.name.split(" ")[0] : "Account"} ({user?.role})
                            </span>
                            <Button variant="secondary" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login">Login</NavLink>
                            <Button to="/register" variant="secondary">Register</Button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
