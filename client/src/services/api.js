/**
 * API Service
 * Centralized HTTP request utility for the Rating Platform client.
 * Handles base URL configuration, JWT header attachment, and standardized error parsing.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Helper to make HTTP requests with automatic JSON parsing and JWT authorization header.
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    if (config.body && typeof config.body === "object") {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Backend returns { success: false, message: "...", errors: [...] }
            const error = new Error(data.message || "An unexpected error occurred");
            error.status = response.status;
            error.errors = data.errors || [];
            throw error;
        }

        return data;
    } catch (err) {
        // If network error (backend unreachable)
        if (!err.status && err.name === "TypeError") {
            const networkError = new Error("Cannot connect to the server. Please ensure the backend is running.");
            networkError.status = 0;
            networkError.errors = [];
            throw networkError;
        }
        throw err;
    }
}

/**
 * Authentication API endpoints
 */
export const authAPI = {
    register: (userData) => request("/auth/register", {
        method: "POST",
        body: userData,
    }),

    login: (credentials) => request("/auth/login", {
        method: "POST",
        body: credentials,
    }),

    getMe: () => request("/auth/me", {
        method: "GET",
    }),
};

export default request;
