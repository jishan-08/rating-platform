import { useState, useEffect, useCallback } from "react";
import Card from "./Card";
import Button from "./Button";
import { LoadingState } from "./StatusState";
import { ownerAPI } from "../services/api";

function StoreOwnerRatingsView() {
    const [ratingsData, setRatingsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchRatings = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const res = await ownerAPI.getRatings();
            setRatingsData(res.data || null);
        } catch (err) {
            console.error("Failed to load store ratings:", err);
            setErrorMessage(err.message || "Failed to load store ratings. Please try again.");
            setRatingsData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRatings();
    }, [fetchRatings]);

    const renderStars = (rating) => {
        const r = Number(rating) || 0;
        return (
            <span style={{ color: "#d97706", fontSize: "1.1rem", letterSpacing: "1px" }} aria-label={`${r} out of 5 stars`}>
                {"★".repeat(r)}
                {"☆".repeat(5 - r)}
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
                <h2>Unable to load store ratings</h2>
                <p>{errorMessage}</p>
                <div style={{ marginTop: "1rem" }}>
                    <Button variant="secondary" onClick={fetchRatings}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!ratingsData?.hasStore) {
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

    const { store, ratings = [] } = ratingsData;

    return (
        <div className="store-owner-ratings-view">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.4rem", margin: 0, color: "var(--ink)" }}>Customer Ratings & Feedback</h2>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                        Verified customer ratings submitted for <strong>{store?.name || "your store"}</strong>.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchRatings}
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
                    Refresh Ratings
                </button>
            </div>

            {ratings.length === 0 ? (
                <Card style={{ padding: "3.5rem 1.5rem", textAlign: "center" }}>
                    <span style={{ fontSize: "3rem", display: "block", marginBottom: "0.75rem" }} aria-hidden="true">
                        ⭐
                    </span>
                    <h3 style={{ fontSize: "1.25rem", color: "var(--ink)", marginBottom: "0.4rem" }}>
                        No ratings yet.
                    </h3>
                    <p style={{ maxWidth: "450px", margin: "0 auto", color: "var(--muted)", fontSize: "0.92rem" }}>
                        Customer reviews and ratings for your store will appear here in real time as they are submitted.
                    </p>
                </Card>
            ) : (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                        <span style={{ fontSize: "0.88rem", color: "var(--muted)", fontWeight: 600 }}>
                            Showing <strong>{ratings.length}</strong> customer review{ratings.length === 1 ? "" : "s"}
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "var(--brand-dark)", fontWeight: 700 }}>
                            Average: ⭐ {store?.averageRating > 0 ? store.averageRating.toFixed(1) : "—"} / 5.0
                        </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {ratings.map((review) => {
                            const dateFormatted = review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                                : "—";

                            return (
                                <Card key={review.id} style={{ padding: "1.25rem 1.5rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                                                {renderStars(review.rating)}
                                                <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--ink)" }}>
                                                    {review.rating}/5
                                                </span>
                                            </div>

                                            <p style={{ margin: "0.2rem 0 0 0", fontWeight: 600, color: "var(--ink)", fontSize: "0.95rem" }}>
                                                👤 {review.customerName || "Verified Customer"}
                                            </p>
                                            <p style={{ margin: "0.1rem 0 0 0", color: "var(--muted)", fontSize: "0.82rem" }}>
                                                {review.customerEmail}
                                            </p>
                                        </div>

                                        <div style={{ textAlign: "right", fontSize: "0.82rem", color: "var(--muted)" }}>
                                            <span>Submitted on</span>
                                            <p style={{ margin: "0.15rem 0 0 0", fontWeight: 600, color: "var(--ink)" }}>
                                                {dateFormatted}
                                            </p>
                                            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Review ID: #{review.id}</span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StoreOwnerRatingsView;
