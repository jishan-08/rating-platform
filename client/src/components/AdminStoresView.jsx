import { useState, useEffect, useCallback } from "react";
import Card from "./Card";
import Input from "./Input";
import Button from "./Button";
import { LoadingState } from "./StatusState";
import { adminAPI } from "../services/api";

function AdminStoresView() {
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Search filter
    const [searchTerm, setSearchTerm] = useState("");

    // Modal / Add Store state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState("");
    const [modalSuccess, setModalSuccess] = useState("");

    // Form fields
    const [storeName, setStoreName] = useState("");
    const [storeEmail, setStoreEmail] = useState("");
    const [storeAddress, setStoreAddress] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const [ownerEmail, setOwnerEmail] = useState("");
    const [ownerPassword, setOwnerPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Field-level errors mapping
    const [fieldErrors, setFieldErrors] = useState({});

    const fetchStores = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const data = await adminAPI.getStores({
                limit: 100,
                sortBy: "created_at",
                sortOrder: "desc",
            });
            setStores(data.stores || []);
        } catch (err) {
            console.error("Failed to fetch stores:", err);
            setErrorMessage(err.message || "Failed to load store registry. Please try again.");
            setStores([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const resetForm = () => {
        setStoreName("");
        setStoreEmail("");
        setStoreAddress("");
        setOwnerName("");
        setOwnerEmail("");
        setOwnerPassword("");
        setShowPassword(false);
        setModalError("");
        setFieldErrors({});
    };

    const handleOpenModal = () => {
        resetForm();
        setModalSuccess("");
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        resetForm();
    };

    const handleCreateStore = async (e) => {
        e.preventDefault();
        setModalError("");
        setModalSuccess("");

        // Comprehensive field-level client validation
        const errors = {};

        if (!storeName.trim()) {
            errors.storeName = "Store name is required.";
        } else if (storeName.trim().length > 255) {
            errors.storeName = "Store name must be between 1 and 255 characters.";
        }

        if (!storeEmail.trim()) {
            errors.storeEmail = "Please enter a valid email address.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeEmail.trim()) || storeEmail.trim().length > 254) {
            errors.storeEmail = "Please enter a valid email address.";
        }

        if (!storeAddress.trim()) {
            errors.storeAddress = "Store address is required.";
        } else if (storeAddress.trim().length > 400) {
            errors.storeAddress = "Store address must be between 1 and 400 characters.";
        }

        if (!ownerName.trim()) {
            errors.ownerName = "Owner full name is required.";
        } else if (ownerName.trim().length < 2 || ownerName.trim().length > 60) {
            errors.ownerName = "Owner full name must be between 2 and 60 characters.";
        }

        if (!ownerEmail.trim()) {
            errors.ownerEmail = "Please enter a valid email address.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail.trim()) || ownerEmail.trim().length > 254) {
            errors.ownerEmail = "Please enter a valid email address.";
        }

        if (!ownerPassword) {
            errors.ownerPassword = "Password must be at least 8 characters.";
        } else if (ownerPassword.length < 8) {
            errors.ownerPassword = "Password must be at least 8 characters.";
        } else if (new TextEncoder().encode(ownerPassword).length > 72) {
            errors.ownerPassword = "Password must be at most 72 bytes.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await adminAPI.createStore({
                name: storeName.trim(),
                email: storeEmail.trim(),
                address: storeAddress.trim(),
                ownerName: ownerName.trim(),
                ownerEmail: ownerEmail.trim(),
                ownerPassword,
                ownerAddress: storeAddress.trim(),
            });

            setModalSuccess(response.message || "Store created successfully. Store owner account has been created and linked to the store.");
            resetForm();

            // Refresh store list immediately
            await fetchStores();

            // Auto close modal after short moment
            setTimeout(() => {
                setIsAddModalOpen(false);
                setModalSuccess("");
            }, 1800);
        } catch (err) {
            console.error("Failed to create store:", err);

            const backendFieldErrors = {};

            if (err.fieldErrors && typeof err.fieldErrors === "object") {
                if (err.fieldErrors.storeName || err.fieldErrors.name) {
                    backendFieldErrors.storeName = err.fieldErrors.storeName || err.fieldErrors.name;
                }
                if (err.fieldErrors.storeEmail || err.fieldErrors.email) {
                    backendFieldErrors.storeEmail = err.fieldErrors.storeEmail || err.fieldErrors.email;
                }
                if (err.fieldErrors.storeAddress || err.fieldErrors.address) {
                    backendFieldErrors.storeAddress = err.fieldErrors.storeAddress || err.fieldErrors.address;
                }
                if (err.fieldErrors.ownerName || err.fieldErrors.owner_name) {
                    backendFieldErrors.ownerName = err.fieldErrors.ownerName || err.fieldErrors.owner_name;
                }
                if (err.fieldErrors.ownerEmail || err.fieldErrors.owner_email) {
                    backendFieldErrors.ownerEmail = err.fieldErrors.ownerEmail || err.fieldErrors.owner_email;
                }
                if (err.fieldErrors.ownerPassword || err.fieldErrors.owner_password) {
                    backendFieldErrors.ownerPassword = err.fieldErrors.ownerPassword || err.fieldErrors.owner_password;
                }
            }

            if (err.status === 409 || (err.message && err.message.toLowerCase().includes("email"))) {
                backendFieldErrors.ownerEmail = err.message || "An account with this email is already registered.";
            }

            if (Object.keys(backendFieldErrors).length > 0) {
                setFieldErrors(backendFieldErrors);
            } else {
                setModalError(err.message || "Unable to create store and owner account.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter stores by keyword
    const filteredStores = stores.filter((s) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.address && s.address.toLowerCase().includes(q)) ||
            (s.email && s.email.toLowerCase().includes(q)) ||
            (s.owner_name && s.owner_name.toLowerCase().includes(q)) ||
            (s.owner_email && s.owner_email.toLowerCase().includes(q))
        );
    });

    const renderStars = (avgRating) => {
        const rating = Number(avgRating) || 0;
        const rounded = Math.round(rating);
        return (
            <span style={{ color: "#d97706", fontSize: "1.1rem", letterSpacing: "1px" }} aria-label={`${rating} out of 5 stars`}>
                {"★".repeat(rounded)}
                {"☆".repeat(5 - rounded)}
            </span>
        );
    };

    return (
        <div className="admin-stores-view">
            {/* Header with Title and Add Store Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.4rem", margin: 0, color: "var(--ink)" }}>Store Management</h2>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                        Manage store directory, view customer rating metrics, and register new store locations.
                    </p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    {!isLoading && (
                        <button
                            type="button"
                            onClick={fetchStores}
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
                            Refresh Stores
                        </button>
                    )}

                    <Button variant="primary" onClick={handleOpenModal}>
                        + Add Store
                    </Button>
                </div>
            </div>

            {/* Success Notification outside modal */}
            {modalSuccess && !isAddModalOpen && (
                <div style={{ marginBottom: "1rem", padding: "0.9rem 1.2rem", borderRadius: "8px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontWeight: 600, fontSize: "0.9rem" }}>
                    ✓ {modalSuccess}
                </div>
            )}

            {/* Search Filter Bar */}
            <Card style={{ padding: "1.25rem 1.4rem", marginBottom: "1.5rem" }}>
                <Input
                    id="admin-search-stores"
                    label="Search Stores by Name, Address, or Owner"
                    type="text"
                    placeholder="Search by store name, address, or owner email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                    <h2>Unable to load store records</h2>
                    <p>{errorMessage}</p>
                    <div style={{ marginTop: "1rem" }}>
                        <Button variant="secondary" onClick={fetchStores}>
                            Try Again
                        </Button>
                    </div>
                </div>
            )}

            {/* Store List Display */}
            {!isLoading && !errorMessage && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.88rem", color: "var(--muted)", fontWeight: 600 }}>
                            Showing <strong>{filteredStores.length}</strong> store{filteredStores.length === 1 ? "" : "s"}
                        </span>
                    </div>

                    {filteredStores.length === 0 ? (
                        <Card style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "var(--ink)" }}>
                                No stores found
                            </p>
                            <p style={{ margin: "0.5rem 0 1.25rem 0", color: "var(--muted)", fontSize: "0.9rem" }}>
                                {searchTerm ? "Try searching with a different term." : "No stores have been registered yet."}
                            </p>
                            <Button variant="primary" onClick={handleOpenModal}>
                                + Add First Store
                            </Button>
                        </Card>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
                            {filteredStores.map((store) => {
                                const avgRating = Number(store.average_rating) || 0;
                                const totalRatings = Number(store.total_ratings) || 0;

                                return (
                                    <Card key={store.id} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)" }}>
                                                    {store.name}
                                                </h3>
                                                <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>
                                                    #{store.id}
                                                </span>
                                            </div>

                                            <p style={{ margin: "0 0 0.35rem 0", color: "var(--muted)", fontSize: "0.88rem" }}>
                                                📍 {store.address}
                                            </p>

                                            {store.email && (
                                                <p style={{ margin: "0 0 0.75rem 0", color: "var(--brand-dark)", fontSize: "0.85rem", fontWeight: 500 }}>
                                                    ✉ {store.email}
                                                </p>
                                            )}

                                            {/* Store Owner Section */}
                                            <div style={{ background: "#f8fafc", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid var(--line)", marginBottom: "1rem" }}>
                                                <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                                                    Store Owner
                                                </span>
                                                <p style={{ margin: "0.15rem 0 0 0", fontWeight: 600, fontSize: "0.88rem", color: "var(--ink)" }}>
                                                    {store.owner_name || "Assigned Owner"}
                                                </p>
                                                <p style={{ margin: "0.1rem 0 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                                                    {store.owner_email}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rating Metrics Footer */}
                                        <div style={{ borderTop: "1px solid var(--line)", paddingTop: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                {renderStars(avgRating)}
                                                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>
                                                    {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                                                </span>
                                            </div>

                                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)" }}>
                                                {totalRatings} total rating{totalRatings === 1 ? "" : "s"}
                                            </span>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ADD STORE MODAL */}
            {isAddModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "grid",
                        placeItems: "center",
                        zIndex: 1000,
                        padding: "1rem",
                    }}
                >
                    <Card
                        style={{
                            maxWidth: "580px",
                            width: "100%",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            padding: "2rem",
                            borderTop: "4px solid var(--brand)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h2 style={{ margin: 0, fontSize: "1.35rem", color: "var(--ink)" }}>Add New Store & Owner</h2>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--muted)", lineHeight: 1 }}
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>

                        <p style={{ margin: "0 0 1.25rem 0", color: "var(--muted)", fontSize: "0.88rem" }}>
                            Create a new store record and immediately provision the store owner account with login credentials in one step.
                        </p>

                        {modalError && (
                            <div className="form-error" style={{ marginBottom: "1rem" }}>
                                <p style={{ margin: 0, fontWeight: 600 }}>{modalError}</p>
                            </div>
                        )}

                        {modalSuccess && (
                            <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "8px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontWeight: 600, fontSize: "0.9rem" }}>
                                ✓ {modalSuccess}
                            </div>
                        )}

                        <form onSubmit={handleCreateStore} noValidate>
                            <h4 style={{ margin: "0.75rem 0 0.5rem 0", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--brand)" }}>
                                🏪 Store Details
                            </h4>

                            <Input
                                id="new-store-name"
                                label="Store Name *"
                                type="text"
                                placeholder="e.g. Apex Supermarket"
                                value={storeName}
                                error={fieldErrors.storeName}
                                onChange={(e) => {
                                    setStoreName(e.target.value);
                                    if (fieldErrors.storeName) {
                                        setFieldErrors((prev) => ({ ...prev, storeName: "" }));
                                    }
                                }}
                                disabled={isSubmitting}
                            />

                            <Input
                                id="new-store-email"
                                label="Store Contact Email *"
                                type="email"
                                placeholder="contact@store.com"
                                value={storeEmail}
                                error={fieldErrors.storeEmail}
                                onChange={(e) => {
                                    setStoreEmail(e.target.value);
                                    if (fieldErrors.storeEmail) {
                                        setFieldErrors((prev) => ({ ...prev, storeEmail: "" }));
                                    }
                                }}
                                disabled={isSubmitting}
                            />

                            <Input
                                id="new-store-address"
                                label="Store Address *"
                                type="text"
                                placeholder="123 Commerce Way, City, State"
                                value={storeAddress}
                                error={fieldErrors.storeAddress}
                                onChange={(e) => {
                                    setStoreAddress(e.target.value);
                                    if (fieldErrors.storeAddress) {
                                        setFieldErrors((prev) => ({ ...prev, storeAddress: "" }));
                                    }
                                }}
                                disabled={isSubmitting}
                            />

                            <h4 style={{ margin: "1.25rem 0 0.5rem 0", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--brand)" }}>
                                👤 Store Owner Account (Login Credentials)
                            </h4>

                            <Input
                                id="new-owner-name"
                                label="Owner Full Name *"
                                type="text"
                                placeholder="Owner Name (e.g. Sarah Jenkins)"
                                value={ownerName}
                                error={fieldErrors.ownerName}
                                onChange={(e) => {
                                    setOwnerName(e.target.value);
                                    if (fieldErrors.ownerName) {
                                        setFieldErrors((prev) => ({ ...prev, ownerName: "" }));
                                    }
                                }}
                                disabled={isSubmitting}
                            />

                            <Input
                                id="new-owner-email"
                                label="Owner Email / Login ID *"
                                type="email"
                                placeholder="owner@store.com"
                                value={ownerEmail}
                                error={fieldErrors.ownerEmail}
                                onChange={(e) => {
                                    setOwnerEmail(e.target.value);
                                    if (fieldErrors.ownerEmail) {
                                        setFieldErrors((prev) => ({ ...prev, ownerEmail: "" }));
                                    }
                                }}
                                disabled={isSubmitting}
                            />

                            <div className="password-field" style={{ position: "relative" }}>
                                <Input
                                    id="new-owner-password"
                                    label="Owner Password * (min 8 characters)"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter login password for owner"
                                    value={ownerPassword}
                                    error={fieldErrors.ownerPassword}
                                    onChange={(e) => {
                                        setOwnerPassword(e.target.value);
                                        if (fieldErrors.ownerPassword) {
                                            setFieldErrors((prev) => ({ ...prev, ownerPassword: "" }));
                                        }
                                    }}
                                    disabled={isSubmitting}
                                />
                                <button
                                    className="password-toggle"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isSubmitting}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    style={{
                                        position: "absolute",
                                        right: "0.65rem",
                                        top: "2rem",
                                        background: "none",
                                        border: "none",
                                        color: "var(--brand-dark)",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                    }}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
                                <Button variant="secondary" type="button" onClick={handleCloseModal} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating Store & Owner..." : "Create Store & Owner"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default AdminStoresView;
