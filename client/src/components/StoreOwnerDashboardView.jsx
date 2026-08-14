import { useState, useEffect, useCallback } from "react";
import Card from "./Card";
import Button from "./Button";
import { LoadingState } from "./StatusState";
import { useAuth } from "../context/useAuth";
import { ownerAPI } from "../services/api";

function StoreOwnerDashboardView() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const res = await ownerAPI.getDashboard();
            setDashboardData(res.data || null);
        } catch (err) {
            console.error("Failed to load store owner dashboard:", err);
            setErrorMessage(err.message || "Failed to load dashboard information. Please try again.");
            setDashboardData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const renderStars = (avgRating) => {
        const rating = Number(avgRating) || 0;
        const rounded = Math.round(rating);
        return (
            <span style={{ color: "#d97706", fontSize: "1.2rem", letterSpacing: "2px" }} aria-label={`${rating} out of 5 stars`}>
                {"★".repeat(rounded)}
                {"☆".repeat(5 - rounded)}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div style={{ padding: "3rem 0" }}>
                <LoadingState />
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="status-state status-state--error">
                <h2>Unable to load store owner dashboard</h2>
                <p>{errorMessage}</p>
                <div style={{ marginTop: "1rem" }}>
                    <Button variant="secondary" onClick={fetchDashboard}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!dashboardData?.hasStore || !dashboardData?.store) {
        return (
            <Card style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                <span style={{ fontSize: "3rem", display: "block", marginBottom: "0.75rem" }} aria-hidden="true">
                    🏪
                </span>
                <h3 style={{ fontSize: "1.3rem", color: "var(--ink)", marginBottom: "0.5rem" }}>
                    No Store Associated
                </h3>
                <p style={{ maxWidth: "500px", margin: "0 auto", color: "var(--muted)", fontSize: "0.95rem" }}>
                    Your account is not currently associated with a store. Please contact the administrator.
                </p>
            </Card>
        );
    }

    const { store, distribution } = dashboardData;
    const totalRatings = Number(store.totalRatings) || 0;
    const averageRating = Number(store.averageRating) || 0;

    const starLevels = [5, 4, 3, 2, 1];

    return (
        <div className="store-owner-dashboard-view">
            {/* Header with Quick Refresh */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.4rem", margin: 0, color: "var(--ink)" }}>Store Owner Dashboard</h2>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                        Live overview and customer rating metrics for your store.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchDashboard}
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
                    Refresh Dashboard
                </button>
            </div>

            {/* MY STORE & RATING OVERVIEW GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
                {/* CARD 1: MY STORE */}
                <Card style={{ padding: "1.75rem 1.5rem", borderTop: "4px solid var(--brand)" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand)" }}>
                        MY STORE
                    </span>
                    <h3 style={{ margin: "0.4rem 0 0.5rem 0", fontSize: "1.5rem", fontWeight: 800, color: "var(--ink)" }}>
                        {store.name}
                    </h3>

                    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.9rem" }}>
                        <p style={{ margin: 0, color: "var(--muted)" }}>
                            📍 <strong>Address:</strong> {store.address}
                        </p>
                        {store.email && (
                            <p style={{ margin: 0, color: "var(--brand-dark)", fontWeight: 500 }}>
                                ✉ <strong>Contact Email:</strong> {store.email}
                            </p>
                        )}
                        <p style={{ margin: "0.25rem 0 0 0", color: "var(--muted)", fontSize: "0.82rem" }}>
                            Store ID: #{store.id}
                        </p>
                    </div>
                </Card>

                {/* CARD 2: RATING OVERVIEW */}
                <Card style={{ padding: "1.75rem 1.5rem", borderTop: "4px solid #d97706" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#b45309" }}>
                        RATING OVERVIEW
                    </span>

                    {totalRatings === 0 ? (
                        <div style={{ marginTop: "1.25rem", padding: "1.5rem 0", textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)" }}>
                                No ratings yet.
                            </p>
                            <p style={{ margin: "0.35rem 0 0 0", color: "var(--muted)", fontSize: "0.88rem" }}>
                                As customers submit reviews for your store, overall score metrics will display here.
                            </p>
                        </div>
                    ) : (
                        <div style={{ marginTop: "0.75rem" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                <span style={{ fontSize: "3rem", fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>
                                    {averageRating.toFixed(1)}
                                </span>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {renderStars(averageRating)}
                                    <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>
                                        out of 5.0
                                    </span>
                                </div>
                            </div>

                            <div style={{ borderTop: "1px solid var(--line)", paddingTop: "0.85rem", marginTop: "1rem", fontSize: "0.92rem", color: "var(--ink)", fontWeight: 700 }}>
                                {totalRatings} total customer review{totalRatings === 1 ? "" : "s"}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* RATING DISTRIBUTION SECTION */}
            <Card style={{ padding: "1.75rem 1.5rem" }}>
                <div style={{ marginBottom: "1.25rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--ink)" }}>
                        Rating Distribution
                    </h3>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
                        Breakdown of individual star reviews submitted by customers.
                    </p>
                </div>

                {totalRatings === 0 ? (
                    <div style={{ padding: "2rem 0", textAlign: "center" }}>
                        <p style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>
                            No ratings yet.
                        </p>
                        <p style={{ margin: "0.25rem 0 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
                            Detailed star rating breakdown will appear once the first review is posted.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "600px" }}>
                        {starLevels.map((stars) => {
                            const count = distribution ? distribution[stars] || 0 : 0;
                            const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

                            return (
                                <div key={stars} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.9rem" }}>
                                    <span style={{ width: "65px", fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>
                                        {stars} Star{stars === 1 ? "" : "s"}
                                    </span>

                                    {/* Progress Bar Container */}
                                    <div
                                        style={{
                                            flex: 1,
                                            height: "14px",
                                            background: "#f1f5f9",
                                            borderRadius: "999px",
                                            overflow: "hidden",
                                            position: "relative",
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: "100%",
                                                width: `${percentage}%`,
                                                background: stars >= 4 ? "#16646b" : stars === 3 ? "#d97706" : "#ef4444",
                                                borderRadius: "999px",
                                                transition: "width 0.3s ease",
                                            }}
                                        />
                                    </div>

                                    <span style={{ width: "45px", textAlign: "right", fontWeight: 700, color: "var(--ink)" }}>
                                        {count}
                                    </span>

                                    <span style={{ width: "45px", textAlign: "right", color: "var(--muted)", fontSize: "0.8rem" }}>
                                        ({percentage}%)
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default StoreOwnerDashboardView;
