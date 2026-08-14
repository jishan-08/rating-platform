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
            // Backend returns { success: false, message: "...", errors: [...], fieldErrors: {...} }
            const error = new Error(data.message || "An unexpected error occurred");
            error.status = response.status;
            error.errors = data.errors || [];
            error.fieldErrors = data.fieldErrors || {};
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
        body: { portal: "standard", ...credentials },
    }),

    adminLogin: (credentials) => request("/auth/login", {
        method: "POST",
        body: { portal: "admin", ...credentials },
    }),

    getMe: () => request("/auth/me", {
        method: "GET",
    }),
};

/**
 * Store API endpoints
 */
export const storeAPI = {
    getStores: (params = {}) => {
        const query = new URLSearchParams();
        if (params.search) query.set("search", params.search);
        if (params.address) query.set("address", params.address);
        if (params.page) query.set("page", params.page);
        if (params.limit) query.set("limit", params.limit);
        if (params.sortBy) query.set("sortBy", params.sortBy);
        if (params.sortOrder) query.set("sortOrder", params.sortOrder);

        const queryString = query.toString();
        return request(`/stores${queryString ? `?${queryString}` : ""}`, {
            method: "GET",
        });
    },

    submitRating: (storeId, rating) => request(`/stores/${storeId}/rating`, {
        method: "POST",
        body: { rating },
    }),
};

/**
 * User API endpoints
 */
export const userAPI = {
    getMyRatings: () => request("/users/me/ratings", {
        method: "GET",
    }),
};

/**
 * Admin API endpoints
 */
export const adminAPI = {
    getDashboard: () => request("/admin/dashboard", {
        method: "GET",
    }),

    getUsers: (params = {}) => {
        const query = new URLSearchParams();
        if (params.name) query.set("name", params.name);
        if (params.email) query.set("email", params.email);
        if (params.address) query.set("address", params.address);
        if (params.role) query.set("role", params.role);
        if (params.page) query.set("page", params.page);
        if (params.limit) query.set("limit", params.limit);
        if (params.sortBy) query.set("sortBy", params.sortBy);
        if (params.sortOrder) query.set("sortOrder", params.sortOrder);

        const queryString = query.toString();
        return request(`/admin/users${queryString ? `?${queryString}` : ""}`, {
            method: "GET",
        });
    },

    getStores: (params = {}) => {
        const query = new URLSearchParams();
        if (params.name) query.set("name", params.name);
        if (params.email) query.set("email", params.email);
        if (params.address) query.set("address", params.address);
        if (params.page) query.set("page", params.page);
        if (params.limit) query.set("limit", params.limit);
        if (params.sortBy) query.set("sortBy", params.sortBy);
        if (params.sortOrder) query.set("sortOrder", params.sortOrder);

        const queryString = query.toString();
        return request(`/admin/stores${queryString ? `?${queryString}` : ""}`, {
            method: "GET",
        });
    },

    createStore: (data) => request("/admin/stores", {
        method: "POST",
        body: data,
    }),
};

export default request;
