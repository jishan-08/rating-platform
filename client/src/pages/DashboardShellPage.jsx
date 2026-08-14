import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import RatingStars from "../components/RatingStars";
import MyRatingsView from "../components/MyRatingsView";
import { LoadingState, EmptyState } from "../components/StatusState";
import { useAuth } from "../context/useAuth";
import { storeAPI } from "../services/api";

const STAR_DESCRIPTIONS = {
    1: "1 star — Poor",
    2: "2 stars — Fair",
    3: "3 stars — Good",
    4: "4 stars — Very Good",
    5: "5 stars — Excellent",
};

function DashboardShellPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Determine current active section: 'browse' or 'my-ratings'
    const isMyRatings = location.hash === "#my-ratings";

    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchName, setSearchName] = useState("");
    const [searchAddress, setSearchAddress] = useState("");
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

    // Store card rating form state
    const [activeRatingStoreId, setActiveRatingStoreId] = useState(null);
    const [selectedRatingValue, setSelectedRatingValue] = useState(0);
    const [isSavingRating, setIsSavingRating] = useState(false);
    const [ratingFeedback, setRatingFeedback] = useState({}); // { [storeId]: { message, type } }

    const fetchStores = useCallback(async (nameFilter, addressFilter, page = 1) => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await storeAPI.getStores({
                search: nameFilter || undefined,
                address: addressFilter || undefined,
                page,
                limit: 12,
            });

            setStores(data.stores || []);
            setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
        } catch (err) {
            console.error("Failed to fetch stores:", err);
            setErrorMessage(err.message || "Failed to load stores. Please try again.");
            setStores([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Debounce search inputs by 300ms for smooth live search
    useEffect(() => {
        if (!isMyRatings) {
            const timer = setTimeout(() => {
                fetchStores(searchName, searchAddress, 1);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchName, searchAddress, fetchStores, isMyRatings]);

    const handleClearFilters = () => {
        setSearchName("");
        setSearchAddress("");
        fetchStores("", "", 1);
    };

    const handleOpenRatingForm = (store) => {
        setActiveRatingStoreId(store.id);
        setSelectedRatingValue(store.myRating || 5);
        setRatingFeedback((prev) => ({ ...prev, [store.id]: null }));
    };

    const handleCloseRatingForm = (storeId) => {
        if (activeRatingStoreId === storeId) {
            setActiveRatingStoreId(null);
            setSelectedRatingValue(0);
        }
    };

    const handleSubmitRating = async (store) => {
        if (!selectedRatingValue || selectedRatingValue < 1 || selectedRatingValue > 5) {
            setRatingFeedback((prev) => ({
                ...prev,
                [store.id]: { message: "Please select a rating between 1 and 5 stars.", type: "error" },
            }));
            return;
        }

        setIsSavingRating(true);
        setRatingFeedback((prev) => ({ ...prev, [store.id]: null }));

        try {
            const response = await storeAPI.submitRating(store.id, selectedRatingValue);
            const updatedData = response.data;

            // Immediately update the store in local state without page reload
            setStores((prevStores) =>
                prevStores.map((item) => {
                    if (item.id === store.id) {
                        return {
                            ...item,
                            myRating: updatedData.myRating,
                            averageRating: updatedData.averageRating,
                            totalRatings: updatedData.totalRatings,
                        };
                    }
                    return item;
                })
            );

            setRatingFeedback((prev) => ({
                ...prev,
                [store.id]: {
                    message: store.myRating ? "Rating updated successfully!" : "Rating submitted successfully!",
                    type: "success",
                },
            }));

            // Close rating panel after saving
            setActiveRatingStoreId(null);
        } catch (err) {
            console.error("Failed to submit rating:", err);
            setRatingFeedback((prev) => ({
                ...prev,
                [store.id]: {
                    message: err.message || "Failed to submit rating. Please try again.",
                    type: "error",
                },
            }));
        } finally {
            setIsSavingRating(false);
        }
    };

    const hasActiveFilters = Boolean(searchName.trim() || searchAddress.trim());

    return (
        <div className="dashboard-page">
            <PageHeader
                eyebrow={isMyRatings ? "User Feedback" : "Store Directory"}
                title={`Welcome, ${user?.name || "Customer"}!`}
            >
                <p>
                    {isMyRatings
                        ? "Review and manage the store ratings and feedback you have submitted."
                        : "Browse registered stores, view overall community ratings, and share your feedback."}
                </p>
            </PageHeader>

            {/* Account Overview Bar */}
            <div style={{ marginBottom: "1.5rem" }}>
                <Card style={{ padding: "1.1rem 1.4rem" }}>
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
                                background: "#16646b",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                            }}
                        >
                            Role: {user?.role}
                        </span>
                    </div>
                </Card>
            </div>

            {/* Tab Navigation for Normal Users */}
            {user?.role === "USER" && (
                <div
                    style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "1.75rem",
                        borderBottom: "2px solid var(--line)",
                        paddingBottom: "0.25rem",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard#browse")}
                        style={{
                            padding: "0.6rem 1.2rem",
                            border: "none",
                            background: "transparent",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: !isMyRatings ? "var(--brand)" : "var(--muted)",
                            borderBottom: !isMyRatings ? "3px solid var(--brand)" : "3px solid transparent",
                            marginBottom: "-4px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}
                    >
                        Browse Stores
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard#my-ratings")}
                        style={{
                            padding: "0.6rem 1.2rem",
                            border: "none",
                            background: "transparent",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: isMyRatings ? "var(--brand)" : "var(--muted)",
                            borderBottom: isMyRatings ? "3px solid var(--brand)" : "3px solid transparent",
                            marginBottom: "-4px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                        }}
                    >
                        My Ratings
                    </button>
                </div>
            )}

            {/* View Switching: My Ratings vs Browse Stores */}
            {isMyRatings ? (
                <MyRatingsView onNavigateToBrowse={() => navigate("/dashboard#browse")} />
            ) : (
                <>
                    {/* Search and Filters Section */}
                    <section style={{ marginBottom: "2rem" }} aria-label="Store search and filters">
                        <Card>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", alignItems: "flex-end" }}>
                                <div className="form-field">
                                    <label htmlFor="store-search-name" style={{ fontWeight: 600 }}>
                                        Search by store name
                                    </label>
                                    <input
                                        id="store-search-name"
                                        type="text"
                                        placeholder="e.g. Campus Book Haven"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="store-search-address" style={{ fontWeight: 600 }}>
                                        Filter by address
                                    </label>
                                    <input
                                        id="store-search-address"
                                        type="text"
                                        placeholder="e.g. University Ave or City"
                                        value={searchAddress}
                                        onChange={(e) => setSearchAddress(e.target.value)}
                                    />
                                </div>

                                {hasActiveFilters && (
                                    <div style={{ display: "flex", alignItems: "center", height: "100%", paddingBottom: "2px" }}>
                                        <Button
                                            variant="secondary"
                                            onClick={handleClearFilters}
                                            style={{ width: "100%", minHeight: "42px" }}
                                        >
                                            Clear Filters
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.88rem", color: "var(--muted)" }}>
                                <span>
                                    {isLoading ? "Searching stores..." : `Found ${pagination.total} store${pagination.total === 1 ? "" : "s"}`}
                                </span>
                                {hasActiveFilters && (
                                    <span>Active filters: {searchName && `name: "${searchName}"`} {searchAddress && `address: "${searchAddress}"`}</span>
                                )}
                            </div>
                        </Card>
                    </section>

                    {/* Store Listing Catalog */}
                    <section aria-label="Available Stores">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Available Stores</h2>
                            {!isLoading && (
                                <button
                                    type="button"
                                    onClick={() => fetchStores(searchName, searchAddress, pagination.page)}
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

                        {isLoading && (
                            <div style={{ padding: "2rem 0" }}>
                                <LoadingState />
                            </div>
                        )}

                        {errorMessage && !isLoading && (
                            <div className="status-state status-state--error">
                                <h2>Unable to load store records</h2>
                                <p>{errorMessage}</p>
                                <div style={{ marginTop: "1rem" }}>
                                    <Button variant="secondary" onClick={() => fetchStores(searchName, searchAddress, 1)}>
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!isLoading && !errorMessage && stores.length === 0 && (
                            <EmptyState title="No stores found">
                                {hasActiveFilters
                                    ? "No stores match your active search filters. Try adjusting your search query or clear filters."
                                    : "There are currently no stores available on the platform."}
                                {hasActiveFilters && (
                                    <div style={{ marginTop: "1.25rem" }}>
                                        <Button variant="secondary" onClick={handleClearFilters}>
                                            Clear Filters
                                        </Button>
                                    </div>
                                )}
                            </EmptyState>
                        )}

                        {!isLoading && !errorMessage && stores.length > 0 && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                                    gap: "1.25rem",
                                }}
                            >
                                {stores.map((store) => {
                                    const isEditingRating = activeRatingStoreId === store.id;
                                    const feedback = ratingFeedback[store.id];

                                    return (
                                        <Card
                                            key={store.id}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                transition: "box-shadow 0.15s ease",
                                            }}
                                        >
                                            <div>
                                                {/* Store Name & Average Rating Badge */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "flex-start",
                                                        gap: "0.75rem",
                                                        marginBottom: "0.5rem",
                                                    }}
                                                >
                                                    <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--ink)", lineHeight: 1.25 }}>
                                                        {store.name}
                                                    </h3>
                                                    <span
                                                        style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "0.3rem",
                                                            padding: "0.3rem 0.65rem",
                                                            borderRadius: "8px",
                                                            background: store.averageRating > 0 ? "#fef3c7" : "#f1f5f9",
                                                            color: store.averageRating > 0 ? "#92400e" : "#64748b",
                                                            fontWeight: 700,
                                                            fontSize: "0.88rem",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                        title={store.averageRating > 0 ? `Average rating: ${store.averageRating} out of 5` : "No ratings submitted yet"}
                                                    >
                                                        <span aria-hidden="true">★</span>
                                                        <span>{store.averageRating > 0 ? store.averageRating.toFixed(1) : "0.0"}</span>
                                                    </span>
                                                </div>

                                                {/* Store Address */}
                                                <p
                                                    style={{
                                                        margin: "0.5rem 0 0.25rem 0",
                                                        fontSize: "0.9rem",
                                                        color: "var(--muted)",
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        gap: "0.4rem",
                                                    }}
                                                >
                                                    <span aria-hidden="true" style={{ color: "var(--brand)" }}>📍</span>
                                                    <span>{store.address}</span>
                                                </p>

                                                {/* Store Email */}
                                                {store.email && (
                                                    <p style={{ margin: "0.25rem 0 0.75rem 0", fontSize: "0.82rem", color: "#64748b" }}>
                                                        <span aria-hidden="true">✉</span> {store.email}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Store Card Footer: Rating Status & Rate Action */}
                                            <div>
                                                {/* Feedback Alert for this store */}
                                                {feedback && (
                                                    <div
                                                        role="alert"
                                                        style={{
                                                            padding: "0.45rem 0.75rem",
                                                            borderRadius: "6px",
                                                            marginBottom: "0.75rem",
                                                            fontSize: "0.82rem",
                                                            fontWeight: 600,
                                                            backgroundColor: feedback.type === "success" ? "#e8f4f4" : "#fceeee",
                                                            color: feedback.type === "success" ? "#12585e" : "var(--danger)",
                                                            border: `1px solid ${feedback.type === "success" ? "#99cfd3" : "#f5c2c2"}`,
                                                        }}
                                                    >
                                                        {feedback.message}
                                                    </div>
                                                )}

                                                {/* Interactive Inline Rating Panel */}
                                                {isEditingRating ? (
                                                    <div
                                                        style={{
                                                            border: "1px solid var(--brand)",
                                                            borderRadius: "10px",
                                                            padding: "0.85rem",
                                                            background: "#f0f7f7",
                                                            marginTop: "0.75rem",
                                                        }}
                                                    >
                                                        <p style={{ margin: "0 0 0.4rem 0", fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-dark)" }}>
                                                            {store.myRating ? "Update your rating:" : "Rate this store (1–5 stars):"}
                                                        </p>

                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                                                            <RatingStars
                                                                value={selectedRatingValue}
                                                                onChange={(val) => setSelectedRatingValue(val)}
                                                                interactive={true}
                                                                size="lg"
                                                                disabled={isSavingRating}
                                                                ariaLabel={`Rating for ${store.name}`}
                                                            />
                                                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)" }}>
                                                                {STAR_DESCRIPTIONS[selectedRatingValue] || ""}
                                                            </span>
                                                        </div>

                                                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem" }}>
                                                            <Button
                                                                onClick={() => handleSubmitRating(store)}
                                                                disabled={isSavingRating}
                                                                style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem", minHeight: "36px" }}
                                                            >
                                                                {isSavingRating
                                                                    ? "Saving..."
                                                                    : store.myRating !== null
                                                                        ? "Update Rating"
                                                                        : "Submit Rating"}
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                onClick={() => handleCloseRatingForm(store.id)}
                                                                disabled={isSavingRating}
                                                                style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem", minHeight: "36px" }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            borderTop: "1px solid var(--line)",
                                                            paddingTop: "0.85rem",
                                                            marginTop: "1rem",
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            flexWrap: "wrap",
                                                            gap: "0.5rem",
                                                        }}
                                                    >
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                                            <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 700 }}>
                                                                {store.totalRatings === 1 ? "1 total rating" : `${store.totalRatings} total ratings`}
                                                            </span>

                                                            {store.myRating !== null ? (
                                                                <span
                                                                    style={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: "0.25rem",
                                                                        padding: "0.2rem 0.55rem",
                                                                        borderRadius: "999px",
                                                                        background: "#e8f4f4",
                                                                        color: "#16646b",
                                                                        fontWeight: 700,
                                                                        fontSize: "0.78rem",
                                                                        width: "fit-content",
                                                                    }}
                                                                >
                                                                    <span aria-hidden="true">★</span> Your rating: {store.myRating}/5
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    style={{
                                                                        padding: "0.2rem 0.55rem",
                                                                        borderRadius: "999px",
                                                                        background: "#f3f4f6",
                                                                        color: "#6b7280",
                                                                        fontSize: "0.78rem",
                                                                        fontWeight: 600,
                                                                        width: "fit-content",
                                                                    }}
                                                                >
                                                                    Not rated yet
                                                                </span>
                                                            )}
                                                        </div>

                                                        {user?.role === "USER" && (
                                                            <Button
                                                                variant={store.myRating !== null ? "secondary" : "primary"}
                                                                onClick={() => handleOpenRatingForm(store)}
                                                                style={{ padding: "0.35rem 0.8rem", fontSize: "0.82rem", minHeight: "34px" }}
                                                            >
                                                                {store.myRating !== null ? "Update Rating" : "Rate Store"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}

export default DashboardShellPage;
