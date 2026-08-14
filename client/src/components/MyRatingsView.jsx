import { useState, useEffect, useCallback } from "react";
import Card from "./Card";
import Button from "./Button";
import RatingStars from "./RatingStars";
import { LoadingState, EmptyState } from "./StatusState";
import { userAPI, storeAPI } from "../services/api";

function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function MyRatingsView({ onNavigateToBrowse }) {
    const [ratings, setRatings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // State for in-place rating editing
    const [editingStoreId, setEditingStoreId] = useState(null);
    const [editingRatingValue, setEditingRatingValue] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [actionFeedback, setActionFeedback] = useState({ message: "", type: "" });

    const fetchRatings = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await userAPI.getMyRatings();
            setRatings(data.ratings || []);
        } catch (err) {
            console.error("Failed to fetch user ratings:", err);
            setErrorMessage(err.message || "Failed to load your ratings. Please try again.");
            setRatings([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRatings();
    }, [fetchRatings]);

    const handleStartEdit = (ratingItem) => {
        setEditingStoreId(ratingItem.storeId);
        setEditingRatingValue(ratingItem.rating);
        setActionFeedback({ message: "", type: "" });
    };

    const handleCancelEdit = () => {
        setEditingStoreId(null);
        setEditingRatingValue(0);
        setActionFeedback({ message: "", type: "" });
    };

    const handleSaveRating = async (storeId) => {
        if (!editingRatingValue || editingRatingValue < 1 || editingRatingValue > 5) {
            setActionFeedback({ message: "Please select a rating between 1 and 5 stars.", type: "error" });
            return;
        }

        setIsSaving(true);
        setActionFeedback({ message: "", type: "" });

        try {
            await storeAPI.submitRating(storeId, editingRatingValue);
            setActionFeedback({ message: "Rating updated successfully!", type: "success" });
            setEditingStoreId(null);
            // Refresh list to show updated values and timestamp
            await fetchRatings();
        } catch (err) {
            console.error("Failed to update rating:", err);
            setActionFeedback({
                message: err.message || "Failed to update rating. Please try again.",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="my-ratings-view">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.4rem", margin: 0, color: "var(--ink)" }}>My Submitted Ratings</h2>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                        Stores and businesses you have reviewed and rated.
                    </p>
                </div>
                {!isLoading && (
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
                        Refresh
                    </button>
                )}
            </div>

            {actionFeedback.message && (
                <div
                    role="alert"
                    style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        marginBottom: "1.25rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        backgroundColor: actionFeedback.type === "success" ? "#e8f4f4" : "#fceeee",
                        color: actionFeedback.type === "success" ? "#12585e" : "var(--danger)",
                        border: `1px solid ${actionFeedback.type === "success" ? "#99cfd3" : "#f5c2c2"}`,
                    }}
                >
                    {actionFeedback.message}
                </div>
            )}

            {isLoading && (
                <div style={{ padding: "2rem 0" }}>
                    <LoadingState />
                </div>
            )}

            {errorMessage && !isLoading && (
                <div className="status-state status-state--error">
                    <h2>Unable to load your ratings</h2>
                    <p>{errorMessage}</p>
                    <div style={{ marginTop: "1rem" }}>
                        <Button variant="secondary" onClick={fetchRatings}>
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

            {!isLoading && !errorMessage && ratings.length === 0 && (
                <EmptyState title="You haven't rated any stores yet.">
                    <p style={{ marginBottom: "1.25rem" }}>
                        Browse our store directory to find local businesses and share your feedback.
                    </p>
                    {onNavigateToBrowse && (
                        <Button onClick={onNavigateToBrowse}>
                            Browse Stores to Rate
                        </Button>
                    )}
                </EmptyState>
            )}

            {!isLoading && !errorMessage && ratings.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "1.25rem",
                    }}
                >
                    {ratings.map((item) => {
                        const isEditing = editingStoreId === item.storeId;
                        const isUpdated = item.updatedAt && item.createdAt &&
                            new Date(item.updatedAt).getTime() > new Date(item.createdAt).getTime() + 1000;

                        return (
                            <Card
                                key={item.id}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div>
                                    {/* Store Name & Star Rating Badge */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            gap: "0.75rem",
                                            marginBottom: "0.5rem",
                                        }}
                                    >
                                        <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--ink)" }}>
                                            {item.storeName}
                                        </h3>
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.3rem",
                                                padding: "0.25rem 0.65rem",
                                                borderRadius: "8px",
                                                background: "#fef3c7",
                                                color: "#92400e",
                                                fontWeight: 700,
                                                fontSize: "0.88rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            <span aria-hidden="true">★</span>
                                            <span>{item.rating} / 5</span>
                                        </span>
                                    </div>

                                    {/* Store Address */}
                                    <p
                                        style={{
                                            margin: "0.5rem 0 0.25rem 0",
                                            fontSize: "0.88rem",
                                            color: "var(--muted)",
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "0.4rem",
                                        }}
                                    >
                                        <span aria-hidden="true" style={{ color: "var(--brand)" }}>📍</span>
                                        <span>{item.storeAddress}</span>
                                    </p>

                                    {/* Store Email if available */}
                                    {item.storeEmail && (
                                        <p style={{ margin: "0.25rem 0 0.75rem 0", fontSize: "0.82rem", color: "#64748b" }}>
                                            <span aria-hidden="true">✉</span> {item.storeEmail}
                                        </p>
                                    )}

                                    {/* Stars Display / Interactive Editor */}
                                    <div style={{ margin: "0.75rem 0", padding: "0.75rem", background: "#f8fafc", borderRadius: "8px" }}>
                                        {isEditing ? (
                                            <div>
                                                <p style={{ margin: "0 0 0.5rem 0", fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>
                                                    Select New Rating:
                                                </p>
                                                <RatingStars
                                                    value={editingRatingValue}
                                                    onChange={(val) => setEditingRatingValue(val)}
                                                    interactive={true}
                                                    size="lg"
                                                    disabled={isSaving}
                                                />
                                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                                                    <Button
                                                        onClick={() => handleSaveRating(item.storeId)}
                                                        disabled={isSaving}
                                                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                                                    >
                                                        {isSaving ? "Saving..." : "Save Rating"}
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={handleCancelEdit}
                                                        disabled={isSaving}
                                                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <div>
                                                    <span style={{ display: "block", fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                                                        Your Score
                                                    </span>
                                                    <RatingStars value={item.rating} size="md" />
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleStartEdit(item)}
                                                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.82rem", minHeight: "32px" }}
                                                >
                                                    Change Rating
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Timestamps Footer */}
                                <div
                                    style={{
                                        borderTop: "1px solid var(--line)",
                                        paddingTop: "0.75rem",
                                        marginTop: "0.75rem",
                                        fontSize: "0.78rem",
                                        color: "var(--muted)",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.2rem",
                                    }}
                                >
                                    <div>
                                        <span style={{ fontWeight: 600 }}>Rated on:</span> {formatDate(item.createdAt)}
                                    </div>
                                    {isUpdated && (
                                        <div>
                                            <span style={{ fontWeight: 600 }}>Updated:</span> {formatDate(item.updatedAt)}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyRatingsView;
