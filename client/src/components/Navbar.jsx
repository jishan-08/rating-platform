import { Link, NavLink } from "react-router-dom";
import Button from "./Button";

function Navbar() {
    return (
        <header className="site-header">
            <nav className="page-container nav" aria-label="Main navigation">
                <Link className="brand" to="/" aria-label="Rating Platform home">
                    <span className="brand-mark" aria-hidden="true">R</span>
                    <span>Rating Platform</span>
                </Link>
                <div className="nav-links">
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/login">Login</NavLink>
                    <Button to="/register" variant="secondary">Register</Button>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
