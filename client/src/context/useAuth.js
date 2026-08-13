import { useContext } from "react";
import { AuthContext } from "./AuthContextCore";

/**
 * Custom hook to consume AuthContext cleanly across components.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default useAuth;
