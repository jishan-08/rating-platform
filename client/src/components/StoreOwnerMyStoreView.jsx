import { useState, useEffect, useCallback } from "react";
import Card from "./Card";
import Button from "./Button";
import { LoadingState } from "./StatusState";
import { ownerAPI } from "../services/api";

function StoreOwnerMyStoreView() {
    const [storeData, setStoreData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchMyStore = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const res = await ownerAPI.getMyStore();
            setStoreData(res.data || null);
        } catch (err) {
            console.error("Failed to load store profile:", err);
            setErrorMessage(err.message || "Failed to load store profile. Please try again.");
            setStoreData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyStore();
    }, [fetchMyStore]);

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
                <h2>Unable to load store profile</h2>
                <p>{errorMessage}</p>
                <div style={{ marginTop: "1rem" }}>
                    <Button variant="secondary" onClick={fetchMyStore}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!storeData?.hasStore || !storeData?.store) {
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

    const { store } = storeData;
    const createdDate = store.createdAt
        ? new Date(store.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "—";

    return (
        <div className="store-owner-my-store-view">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                    <h2 style={{ fontSize: "1.4rem", margin: 0, color: "var(--ink)" }}>My Store Profile</h2>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                        Official registry and contact details for your store location.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchMyStore}
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
                    Refresh Profile
                </button>
            </div>

            <Card style={{ padding: "2rem", borderTop: "4px solid var(--brand)", maxWidth: "800px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                        <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand)" }}>
                            REGISTERED STORE LOCATION
                        </span>
                        <h3 style={{ margin: "0.3rem 0 0 0", fontSize: "1.75rem", fontWeight: 800, color: "var(--ink)" }}>
                            {store.name}
                        </h3>
                    </div>

                    <span
                        style={{
                            padding: "0.35rem 0.8rem",
                            borderRadius: "999px",
                            background: "#e8f4f4",
                            color: "var(--brand)",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                        }}
                    >
                        Store ID: #{store.id}
                    </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", borderTop: "1px solid var(--line)", paddingTop: "1.5rem" }}>
                    <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                            Physical Address
                        </span>
                        <p style={{ margin: "0.35rem 0 0 0", fontWeight: 600, fontSize: "1rem", color: "var(--ink)" }}>
                            📍 {store.address}
                        </p>
                    </div>

                    <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                            Store Contact Email
                        </span>
                        <p style={{ margin: "0.35rem 0 0 0", fontWeight: 600, fontSize: "1rem", color: "var(--brand-dark)" }}>
                            ✉ {store.email || "—"}
                        </p>
                    </div>

                    <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                            Assigned Store Owner
                        </span>
                        <p style={{ margin: "0.35rem 0 0 0", fontWeight: 600, fontSize: "1rem", color: "var(--ink)" }}>
                            👤 {store.ownerName}
                        </p>
                        <p style={{ margin: "0.15rem 0 0 0", color: "var(--muted)", fontSize: "0.85rem" }}>
                            {store.ownerEmail}
                        </p>
                    </div>

                    <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                            Listed Since
                        </span>
                        <p style={{ margin: "0.35rem 0 0 0", fontWeight: 600, fontSize: "1rem", color: "var(--ink)" }}>
                            📅 {createdDate}
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: "2rem", borderTop: "1px solid var(--line)", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                        Store data is maintained securely by platform administrators.
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                        ⭐ {store.averageRating > 0 ? store.averageRating.toFixed(1) : "—"} ({store.totalRatings} total rating{store.totalRatings === 1 ? "" : "s"})
                    </span>
                </div>
            </Card>
        </div>
    );
}

export default StoreOwnerMyStoreView;
