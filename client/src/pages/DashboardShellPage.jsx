import { useState, useEffect, useCallback } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import { LoadingState, EmptyState } from "../components/StatusState";
import { useAuth } from "../context/useAuth";
import { storeAPI } from "../services/api";

function DashboardShellPage() {
    const { user } = useAuth();

    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchName, setSearchName] = useState("");
    const [searchAddress, setSearchAddress] = useState("");
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

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
        const timer = setTimeout(() => {
            fetchStores(searchName, searchAddress, 1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchName, searchAddress, fetchStores]);

    const handleClearFilters = () => {
        setSearchName("");
        setSearchAddress("");
        fetchStores("", "", 1);
    };

    const hasActiveFilters = Boolean(searchName.trim() || searchAddress.trim());

    return (
        <div className="dashboard-page">
            <PageHeader
                eyebrow="Store Directory"
                title={`Welcome, ${user?.name || "Customer"}!`}
            >
                <p>
                    Browse registered stores, view overall community ratings, and check your submitted feedback.
                </p>
            </PageHeader>

            {/* Account Overview Bar */}
            <div style={{ marginBottom: "2rem" }}>
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
                        {stores.map((store) => (
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

                                {/* Ratings Summary & User Rating Status */}
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
                                    <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 600 }}>
                                        {store.totalRatings === 1 ? "1 total rating" : `${store.totalRatings} total ratings`}
                                    </span>

                                    {store.myRating !== null ? (
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.25rem",
                                                padding: "0.25rem 0.65rem",
                                                borderRadius: "999px",
                                                background: "#e8f4f4",
                                                color: "#16646b",
                                                fontWeight: 700,
                                                fontSize: "0.82rem",
                                            }}
                                        >
                                            <span aria-hidden="true">★</span> Your rating: {store.myRating}/5
                                        </span>
                                    ) : (
                                        <span
                                            style={{
                                                padding: "0.25rem 0.65rem",
                                                borderRadius: "999px",
                                                background: "#f3f4f6",
                                                color: "#6b7280",
                                                fontSize: "0.82rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Not rated yet
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default DashboardShellPage;
