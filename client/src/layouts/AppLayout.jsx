import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function AppLayout() {
    return (
        <div className="app-shell">
            <Navbar />
            <main><Outlet /></main>
            <footer className="site-footer"><div className="page-container">Rating Platform</div></footer>
        </div>
    );
}

export default AppLayout;
