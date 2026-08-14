import { useState, useEffect, useCallback } from "react";
import Card from "./Card";
import Input from "./Input";
import Button from "./Button";
import { LoadingState } from "./StatusState";
import { adminAPI } from "../services/api";

function AdminUsersView() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const params = {
                limit: 100,
                sortBy: "created_at",
                sortOrder: "desc",
            };

            if (selectedRole) {
                params.role = selectedRole;
            }

            const data = await adminAPI.getUsers(params);
            setUsers(data.users || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setErrorMessage(err.message || "Failed to load user accounts. Please try again.");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Client-side quick filter by keyword (name or email or address)
    const filteredUsers = users.filter((u) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q)) ||
            (u.address && u.address.toLowerCase().includes(q))
        );
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case "ADMIN":
                return {
                    label: "ADMIN",
                    bg: "#0f4c52",
                    color: "#ffffff",
                    border: "none",
                };
            case "STORE_OWNER":
                return {
                    label: "STORE OWNER",
                    bg: "#fef3c7",
                    color: "#92400e",
                    border: "1px solid #fde68a",
                };
            default:
                return {
                    label: "CUSTOMER",
                    bg: "#e8f4f4",
                    color: "#0f4c52",
                    border: "1px solid #bce1e3",
                };
        }
    };

    return (
        <div className="admin-users-view">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.4rem", margin: 0, color: "var(--ink)" }}>User Management</h2>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                        View, search, and audit all registered platform accounts across roles.
                    </p>
                </div>

                {!isLoading && (
                    <button
                        type="button"
                        onClick={fetchUsers}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--brand-dark)",
                            fontWeight: 600,
                            fontSize: "0.88rem",
                            cursor: "pointer",
                            textDecoration: "underline",
                        }}
                    >
                        Refresh Users
                    </button>
                )}
            </div>

            {/* Search and Role Filter Bar */}
            <Card style={{ padding: "1.25rem 1.4rem", marginBottom: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", alignItems: "flex-end" }}>
                    <div>
                        <Input
                            id="admin-search-users"
                            label="Search by Name or Email"
                            type="text"
                            placeholder="Type to filter users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="admin-role-filter" className="input-label">
                            Filter by Role
                        </label>
                        <select
                            id="admin-role-filter"
                            className="input-field"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            style={{ height: "42px" }}
                        >
                            <option value="">All Roles</option>
                            <option value="USER">Customers only</option>
                            <option value="STORE_OWNER">Store Owners only</option>
                            <option value="ADMIN">Administrators only</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Loading State */}
            {isLoading && (
                <div style={{ padding: "3rem 0" }}>
                    <LoadingState />
                </div>
            )}

            {/* Error State */}
            {errorMessage && !isLoading && (
                <div className="status-state status-state--error">
                    <h2>Unable to load user accounts</h2>
                    <p>{errorMessage}</p>
                    <div style={{ marginTop: "1rem" }}>
                        <Button variant="secondary" onClick={fetchUsers}>
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

            {/* User List Display */}
            {!isLoading && !errorMessage && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.88rem", color: "var(--muted)", fontWeight: 600 }}>
                            Showing <strong>{filteredUsers.length}</strong> user{filteredUsers.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    {filteredUsers.length === 0 ? (
                        <Card style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)" }}>
                                No registered users found
                            </p>
                            <p style={{ margin: "0.5rem 0 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
                                {searchTerm || selectedRole ? "Try adjusting your search criteria or role filter." : "No user accounts exist in the database."}
                            </p>
                        </Card>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {filteredUsers.map((userItem) => {
                                const badge = getRoleBadge(userItem.role);
                                const createdDate = userItem.created_at
                                    ? new Date(userItem.created_at).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric",
                                      })
                                    : "—";

                                return (
                                    <Card key={userItem.id} style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                                            <div style={{ flex: "1 1 300px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                                                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--ink)" }}>
                                                        {userItem.name}
                                                    </h3>
                                                    <span
                                                        style={{
                                                            padding: "0.2rem 0.6rem",
                                                            borderRadius: "999px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: 800,
                                                            letterSpacing: "0.04em",
                                                            background: badge.bg,
                                                            color: badge.color,
                                                            border: badge.border,
                                                        }}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                </div>

                                                <p style={{ margin: "0.35rem 0 0 0", color: "var(--brand-dark)", fontSize: "0.92rem", fontWeight: 500 }}>
                                                    {userItem.email}
                                                </p>

                                                {userItem.address && (
                                                    <p style={{ margin: "0.35rem 0 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
                                                        📍 {userItem.address}
                                                    </p>
                                                )}
                                            </div>

                                            <div style={{ textAlign: "right", fontSize: "0.82rem", color: "var(--muted)" }}>
                                                <span>Member since</span>
                                                <p style={{ margin: "0.15rem 0 0 0", fontWeight: 600, color: "var(--ink)" }}>{createdDate}</p>
                                                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>ID: #{userItem.id}</span>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default AdminUsersView;
