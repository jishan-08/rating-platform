import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import { LoadingState } from "../components/StatusState";
import { useAuth } from "../context/useAuth";
import { adminAPI } from "../services/api";
import AdminUsersView from "../components/AdminUsersView";
import AdminStoresView from "../components/AdminStoresView";

function AdminDashboardPage() {
    const { user } = useAuth();
    const location = useLocation();

    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Determine current view from URL hash: '#users', '#stores', or default (overview)
    const currentHash = location.hash || "#dashboard";
    const isUsersView = currentHash === "#users";
    const isStoresView = currentHash === "#stores";
    const isOverview = !isUsersView && !isStoresView;

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await adminAPI.getDashboard();
            setStats(data.data || data.statistics || { totalUsers: 0, totalStores: 0, totalRatings: 0 });
        } catch (err) {
            console.error("Failed to load admin dashboard stats:", err);
            setErrorMessage(err.message || "Failed to load system statistics. Please try again.");
            setStats(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOverview) {
            fetchStatistics();
        }
    }, [isOverview, fetchStatistics]);

    return (
        <div className="admin-dashboard-page">
            {/* Contextual Page Header */}
            {isOverview && (
                <PageHeader
                    eyebrow="System Administration"
                    title="Dashboard Overview"
                >
                    <p>
                        Welcome, <strong>{user?.name || "Administrator"}</strong>. Monitor real-time system metrics, platform volume, and role distributions.
                    </p>
                </PageHeader>
            )}

            {isUsersView && (
                <PageHeader
                    eyebrow="System Administration"
                    title="User Management"
                >
                    <p>
                        Inspect registered user accounts, filter by role, and verify platform membership details.
                    </p>
                </PageHeader>
            )}

            {isStoresView && (
                <PageHeader
                    eyebrow="System Administration"
                    title="Store Management"
                >
                    <p>
                        Manage store directory, view rating summaries, and register new store locations with associated owners.
                    </p>
                </PageHeader>
            )}

            {/* Signed-in Administrator Status Bar */}
            <div style={{ marginBottom: "1.5rem" }}>
                <Card style={{ padding: "1.1rem 1.4rem", borderLeft: "4px solid var(--accent)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                        <div>
                            <span style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                                Signed In As
                            </span>
                            <p style={{ margin: "0.15rem 0 0 0", fontWeight: 700, color: "var(--ink)", fontSize: "1.05rem" }}>
                                {user?.name} <span style={{ fontWeight: 500, fontSize: "0.9rem", color: "var(--muted)" }}>({user?.email})</span>
                            </p>
                        </div>

                        <span
                            style={{
                                padding: "0.35rem 0.8rem",
                                borderRadius: "999px",
                                background: "#0f4c52",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Role: {user?.role}
                        </span>
                    </div>
                </Card>
            </div>

            {/* VIEW 1: Dashboard Overview Content */}
            {isOverview && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                        <div>
                            <h2 style={{ fontSize: "1.4rem", margin: 0, color: "var(--ink)" }}>Platform Statistics</h2>
                            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                                Live database metrics aggregated from MySQL.
                            </p>
                        </div>
                        {!isLoading && (
                            <button
                                type="button"
                                onClick={fetchStatistics}
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
                                Refresh Stats
                            </button>
                        )}
                    </div>

                    {isLoading && (
                        <div style={{ padding: "3rem 0" }}>
                            <LoadingState />
                        </div>
                    )}

                    {errorMessage && !isLoading && (
                        <div className="status-state status-state--error">
                            <h2>Unable to load statistics</h2>
                            <p>{errorMessage}</p>
                            <div style={{ marginTop: "1rem" }}>
                                <Button variant="secondary" onClick={fetchStatistics}>
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}

                    {!isLoading && !errorMessage && stats && (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: "1.25rem",
                                marginBottom: "2rem",
                            }}
                        >
                            {/* Card 1: Total Users */}
                            <Card style={{ padding: "1.75rem 1.5rem", position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.06em" }}>
                                            Total Users
                                        </p>
                                        <h3 style={{ margin: "0.4rem 0 0 0", fontSize: "2.8rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
                                            {stats.totalUsers ?? 0}
                                        </h3>
                                    </div>
                                    <span
                                        style={{
                                            display: "grid",
                                            placeItems: "center",
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "12px",
                                            background: "#e8f4f4",
                                            color: "var(--brand)",
                                            fontSize: "1.4rem",
                                        }}
                                        aria-hidden="true"
                                    >
                                        👥
                                    </span>
                                </div>
                                <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line)", paddingTop: "0.75rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                                    {stats.roles ? (
                                        <span>
                                            <strong>{stats.roles.users ?? 0}</strong> Customers •{" "}
                                            <strong>{stats.roles.storeOwners ?? 0}</strong> Store Owners •{" "}
                                            <strong>{stats.roles.admins ?? 0}</strong> Admins
                                        </span>
                                    ) : (
                                        <span>Registered accounts across all roles</span>
                                    )}
                                </div>
                            </Card>

                            {/* Card 2: Total Stores */}
                            <Card style={{ padding: "1.75rem 1.5rem", position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.06em" }}>
                                            Total Stores
                                        </p>
                                        <h3 style={{ margin: "0.4rem 0 0 0", fontSize: "2.8rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
                                            {stats.totalStores ?? 0}
                                        </h3>
                                    </div>
                                    <span
                                        style={{
                                            display: "grid",
                                            placeItems: "center",
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "12px",
                                            background: "#fef3c7",
                                            color: "#92400e",
                                            fontSize: "1.4rem",
                                        }}
                                        aria-hidden="true"
                                    >
                                        🏪
                                    </span>
                                </div>
                                <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line)", paddingTop: "0.75rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                                    <span>Active store records listed on platform</span>
                                </div>
                            </Card>

                            {/* Card 3: Total Ratings */}
                            <Card style={{ padding: "1.75rem 1.5rem", position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)", letterSpacing: "0.06em" }}>
                                            Total Ratings
                                        </p>
                                        <h3 style={{ margin: "0.4rem 0 0 0", fontSize: "2.8rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
                                            {stats.totalRatings ?? 0}
                                        </h3>
                                    </div>
                                    <span
                                        style={{
                                            display: "grid",
                                            placeItems: "center",
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "12px",
                                            background: "#fdf2e9",
                                            color: "#b45309",
                                            fontSize: "1.4rem",
                                        }}
                                        aria-hidden="true"
                                    >
                                        ⭐
                                    </span>
                                </div>
                                <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--line)", paddingTop: "0.75rem", fontSize: "0.82rem", color: "var(--muted)" }}>
                                    <span>Verified customer store reviews submitted</span>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* VIEW 2: User Management View */}
            {isUsersView && <AdminUsersView />}

            {/* VIEW 3: Store Management View */}
            {isStoresView && <AdminStoresView />}
        </div>
    );
}

export default AdminDashboardPage;
