import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { LoadingState } from "./StatusState";

/**
 * ProtectedRoute Guard
 * Restricts access to authenticated users only.
 * Optionally restricts access by allowed user roles.
 */
function ProtectedRoute({ allowedRoles, children }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="page-container" style={{ padding: "4rem 0" }}>
                <LoadingState />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to /login and preserve current location to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return (
            <div className="page-container" style={{ padding: "4rem 0" }}>
                <div className="status-state status-state--error">
                    <h2>Access Denied</h2>
                    <p>You do not have permission to view this section.</p>
                </div>
            </div>
        );
    }

    return children ? children : <Outlet />;
}

export default ProtectedRoute;
