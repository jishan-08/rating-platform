import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import RatingStars from "../components/RatingStars";
import MyRatingsView from "../components/MyRatingsView";
import StoreOwnerDashboardView from "../components/StoreOwnerDashboardView";
import StoreOwnerMyStoreView from "../components/StoreOwnerMyStoreView";
import StoreOwnerRatingsView from "../components/StoreOwnerRatingsView";
import { LoadingState, EmptyState } from "../components/StatusState";
import { useAuth } from "../context/useAuth";
import { storeAPI } from "../services/api";

const STAR_DESCRIPTIONS = {
    0: "Select a rating (1–5 stars)",
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

    // Store Owner subview flags
    const isStoreOwner = user?.role === "STORE_OWNER";
    const isOwnerMyStore = location.hash === "#my-store" || location.hash === "#store";
    const isOwnerRatings = location.hash === "#ratings";
    const isOwnerDashboard = !isOwnerMyStore && !isOwnerRatings;

    // Customer subview flag
    const isMyRatings = location.hash === "#my-ratings";

    // Customer store browsing state
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

    // Debounce search inputs by 300ms for smooth live search (customer only)
    useEffect(() => {
        if (!isStoreOwner && !isMyRatings) {
            const timer = setTimeout(() => {
                fetchStores(searchName, searchAddress, 1);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchName, searchAddress, fetchStores, isMyRatings, isStoreOwner]);

    const handleClearFilters = () => {
        setSearchName("");
        setSearchAddress("");
        fetchStores("", "", 1);
    };

    const handleOpenRatingForm = (store) => {
        setActiveRatingStoreId(store.id);
        const currentRating = store.myRating !== null && store.myRating !== undefined ? Number(store.myRating) : 0;
        setSelectedRatingValue(currentRating);
        setRatingFeedback((prev) => ({ ...prev, [store.id]: null }));
    };

    const handleCloseRatingForm = (storeId) => {
        if (activeRatingStoreId === storeId) {
            setActiveRatingStoreId(null);
            setSelectedRatingValue(0);
            setRatingFeedback((prev) => ({ ...prev, [storeId]: null }));
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

    // =========================================================================
    // RENDER: STORE OWNER EXPERIENCE
    // =========================================================================
    if (isStoreOwner) {
        return (
            <div className="dashboard-page store-owner-dashboard">
                <PageHeader
                    eyebrow="Store Management"
                    title={
                        isOwnerDashboard
                            ? `Welcome, ${user?.name || "Store Owner"}!`
                            : isOwnerMyStore
                                ? "My Store"
                                : "Store Ratings"
                    }
                >
                    <p>
                        {isOwnerDashboard
                            ? "Monitor your store performance, review distribution metrics, and oversee customer ratings."
                            : isOwnerMyStore
                                ? "Official registry and contact details for your store location."
                                : "Verified customer reviews and feedback for your store."}
                    </p>
                </PageHeader>

                {/* Account Overview Bar */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <Card style={{ padding: "1.1rem 1.4rem", borderLeft: "4px solid #d97706" }}>
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
                                    background: "#fef3c7",
                                    color: "#92400e",
                                    border: "1px solid #fde68a",
                                    fontWeight: 800,
                                    fontSize: "0.82rem",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                Role: STORE_OWNER
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Store Owner Subviews */}
                {isOwnerDashboard && <StoreOwnerDashboardView />}
                {isOwnerMyStore && <StoreOwnerMyStoreView />}
                {isOwnerRatings && <StoreOwnerRatingsView />}
            </div>
        );
    }

    // =========================================================================
    // RENDER: CUSTOMER / USER EXPERIENCE (PRESERVED)
    // =========================================================================
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

                    {/* Stores List Section */}
                    <section aria-label="Available stores directory">
                        {isLoading && (
                            <div style={{ padding: "3rem 0" }}>
                                <LoadingState />
                            </div>
                        )}

                        {errorMessage && !isLoading && (
                            <div className="status-state status-state--error">
                                <h2>Unable to load stores</h2>
                                <p>{errorMessage}</p>
                                <div style={{ marginTop: "1rem" }}>
                                    <Button variant="secondary" onClick={() => fetchStores(searchName, searchAddress, pagination.page)}>
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!isLoading && !errorMessage && stores.length === 0 && (
                            <Card style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                                <EmptyState />
                                <h3 style={{ marginTop: "1rem", color: "var(--ink)" }}>No stores found</h3>
                                <p style={{ maxWidth: "420px", margin: "0.5rem auto 1.5rem auto" }}>
                                    {hasActiveFilters
                                        ? "No registered stores match your current search filters. Try searching for a different name or location."
                                        : "There are currently no stores available in the platform directory."}
                                </p>
                                {hasActiveFilters && (
                                    <Button variant="secondary" onClick={handleClearFilters}>
                                        Clear All Search Filters
                                    </Button>
                                )}
                            </Card>
                        )}

                        {!isLoading && !errorMessage && stores.length > 0 && (
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                                    gap: "1.5rem",
                                }}
                            >
                                {stores.map((store) => {
                                    const isRatingFormOpen = activeRatingStoreId === store.id;
                                    const feedback = ratingFeedback[store.id];

                                    return (
                                        <Card key={store.id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                            <div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.5rem" }}>
                                                    <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--ink)", fontWeight: 700 }}>
                                                        {store.name}
                                                    </h3>
                                                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>
                                                        #{store.id}
                                                    </span>
                                                </div>

                                                <p style={{ margin: "0 0 0.5rem 0", color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.4 }}>
                                                    📍 {store.address}
                                                </p>

                                                {store.email && (
                                                    <p style={{ margin: "0 0 1rem 0", color: "var(--brand-dark)", fontSize: "0.85rem", fontWeight: 500 }}>
                                                        ✉ {store.email}
                                                    </p>
                                                )}

                                                {/* Star rating display */}
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                                    <RatingStars value={store.averageRating} readOnly size="md" />
                                                    <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>
                                                        {store.averageRating > 0 ? store.averageRating.toFixed(1) : "—"}
                                                    </span>
                                                </div>

                                                {/* Rating submission feedback message */}
                                                {feedback && (
                                                    <div
                                                        style={{
                                                            padding: "0.5rem 0.75rem",
                                                            borderRadius: "6px",
                                                            fontSize: "0.82rem",
                                                            marginBottom: "0.75rem",
                                                            background: feedback.type === "error" ? "#fceeee" : "#e8f4f4",
                                                            color: feedback.type === "error" ? "var(--danger)" : "#12585e",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {feedback.message}
                                                    </div>
                                                )}

                                                {/* Rating form panel */}
                                                {isRatingFormOpen ? (
                                                    <div
                                                        style={{
                                                            borderTop: "1px solid var(--line)",
                                                            paddingTop: "1rem",
                                                            marginTop: "0.75rem",
                                                            background: "#f9fbfb",
                                                            padding: "1rem",
                                                            borderRadius: "8px",
                                                        }}
                                                    >
                                                        <p style={{ margin: "0 0 0.5rem 0", fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)" }}>
                                                            {store.myRating !== null ? "Update your rating:" : "Rate this store:"}
                                                        </p>

                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                                                            <RatingStars
                                                                value={selectedRatingValue}
                                                                onChange={(val) => {
                                                                    setSelectedRatingValue(val);
                                                                    setRatingFeedback((prev) => ({ ...prev, [store.id]: null }));
                                                                }}
                                                                interactive={true}
                                                                size="lg"
                                                                disabled={isSavingRating}
                                                            />
                                                            <span
                                                                style={{
                                                                    fontSize: "0.88rem",
                                                                    fontWeight: 600,
                                                                    color: selectedRatingValue > 0 ? "var(--brand-dark)" : "var(--muted)",
                                                                }}
                                                            >
                                                                {STAR_DESCRIPTIONS[selectedRatingValue] || (selectedRatingValue > 0 ? `${selectedRatingValue} stars` : "Click a star to rate")}
                                                            </span>
                                                        </div>

                                                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                                                            <Button
                                                                variant="primary"
                                                                onClick={() => handleSubmitRating(store)}
                                                                disabled={isSavingRating}
                                                                style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem", minHeight: "36px" }}
                                                            >
                                                                {isSavingRating ? "Saving..." : store.myRating !== null ? "Update" : "Submit Rating"}
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
