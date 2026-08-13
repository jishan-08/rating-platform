import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/useAuth";

function DashboardShellPage() {
    const { user } = useAuth();

    const formattedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "Recently";

    return (
        <div className="dashboard-page">
            <PageHeader
                eyebrow="Authenticated Workspace"
                title={`Welcome, ${user?.name || "User"}!`}
            >
                <p>
                    You are signed in to the Rating Platform. Your session is secured with a JSON Web Token (JWT).
                </p>
            </PageHeader>

            <div style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
                <Card>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                        <div>
                            <p className="eyebrow" style={{ margin: 0 }}>Account Details</p>
                            <h2 style={{ fontSize: "1.5rem", margin: "0.25rem 0" }}>{user?.name}</h2>
                            <p style={{ margin: 0, color: "var(--muted)" }}>{user?.email}</p>
                        </div>
                        <span
                            style={{
                                padding: "0.4rem 0.85rem",
                                borderRadius: "999px",
                                background: user?.role === "ADMIN" ? "#16646b" : "#edf2f4",
                                color: user?.role === "ADMIN" ? "#ffffff" : "#16202a",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                            }}
                        >
                            Role: {user?.role}
                        </span>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "1rem",
                            marginTop: "1.5rem",
                            paddingTop: "1.25rem",
                            borderTop: "1px solid var(--line)",
                        }}
                    >
                        <div>
                            <span style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                                User ID
                            </span>
                            <p style={{ margin: "0.25rem 0 0 0", fontWeight: 600, color: "var(--ink)" }}>#{user?.id}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                                Address
                            </span>
                            <p style={{ margin: "0.25rem 0 0 0", fontWeight: 600, color: "var(--ink)" }}>{user?.address || "N/A"}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                                Member Since
                            </span>
                            <p style={{ margin: "0.25rem 0 0 0", fontWeight: 600, color: "var(--ink)" }}>{formattedDate}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <h2 style={{ fontSize: "1.35rem", marginBottom: "1rem" }}>Workspace Modules</h2>
            <div className="dashboard-cards">
                <Card style={{ borderColor: user?.role === "ADMIN" ? "var(--brand)" : undefined }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <h3 style={{ margin: 0 }}>Admin Panel</h3>
                        {user?.role === "ADMIN" && (
                            <span style={{ fontSize: "0.75rem", background: "#e8f4f4", color: "#16646b", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>
                                Active
                            </span>
                        )}
                    </div>
                    <p>Manage system users, register store owners, and create new store records.</p>
                </Card>

                <Card style={{ borderColor: user?.role === "USER" ? "var(--brand)" : undefined }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <h3 style={{ margin: 0 }}>Store Discovery & Ratings</h3>
                        {user?.role === "USER" && (
                            <span style={{ fontSize: "0.75rem", background: "#e8f4f4", color: "#16646b", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>
                                Active
                            </span>
                        )}
                    </div>
                    <p>Explore registered stores, submit 1–5 star ratings, and manage your feedback.</p>
                </Card>

                <Card style={{ borderColor: user?.role === "STORE_OWNER" ? "var(--brand)" : undefined }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <h3 style={{ margin: 0 }}>Store Owner Insights</h3>
                        {user?.role === "STORE_OWNER" && (
                            <span style={{ fontSize: "0.75rem", background: "#e8f4f4", color: "#16646b", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>
                                Active
                            </span>
                        )}
                    </div>
                    <p>Review customer ratings, view average scores, and inspect store performance.</p>
                </Card>
            </div>
        </div>
    );
}

export default DashboardShellPage;
