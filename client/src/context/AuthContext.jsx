import { useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";
import { AuthContext } from "./AuthContextCore";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Verify existing token on initial application load by fetching the current user profile.
     */
    const loadUser = useCallback(async () => {
        const savedToken = localStorage.getItem("token");
        if (!savedToken) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const data = await authAPI.getMe();
            if (data.user) {
                setUser(data.user);
            } else {
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            }
        } catch {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    /**
     * User Login: sends credentials to backend for standard login.
     */
    const login = async (credentials) => {
        const data = await authAPI.login(credentials);
        if (data.token && data.user) {
            localStorage.setItem("token", data.token);
            setToken(data.token);
            setUser(data.user);
        }
        return data;
    };

    /**
     * Admin Login: sends credentials to backend for admin portal login.
     */
    const adminLogin = async (credentials) => {
        const data = await authAPI.adminLogin(credentials);
        if (data.token && data.user) {
            localStorage.setItem("token", data.token);
            setToken(data.token);
            setUser(data.user);
        }
        return data;
    };

    /**
     * User Registration: registers a new standard user account.
     */
    const register = async (userData) => {
        return await authAPI.register(userData);
    };

    /**
     * User Logout: removes token and clears user state.
     */
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user && token),
        login,
        adminLogin,
        register,
        logout,
        refreshUser: loadUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
