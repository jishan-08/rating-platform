import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useAuth } from "../context/useAuth";

function AdminLoginPage() {
    const { adminLogin, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState([]);

    // If already logged in as ADMIN, redirect to /admin directly
    if (isAuthenticated && user?.role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setFieldErrors([]);

        if (!email.trim() || !password) {
            setErrorMessage("Please enter both administrator email and password.");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await adminLogin({ email: email.trim(), password });
            if (data.user?.role === "ADMIN") {
                navigate("/admin", { replace: true });
            }
        } catch (err) {
            setErrorMessage(err.message || "Failed to authenticate administrator credentials.");
            if (Array.isArray(err.errors)) {
                setFieldErrors(err.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="auth-page page-container">
            <Card className="auth-card" style={{ borderTop: "4px solid var(--brand)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span
                        style={{
                            padding: "0.25rem 0.65rem",
                            borderRadius: "999px",
                            background: "#0f4c52",
                            color: "#ffffff",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                        }}
                    >
                        Admin Portal
                    </span>
                </div>

                <h1>Administrator Login</h1>
                <p className="auth-intro">
                    Sign in with your system credentials to access platform controls, user oversight, and live metrics.
                </p>

                {errorMessage && (
                    <div className="form-error" role="alert">
                        <p style={{ margin: 0, fontWeight: 600 }}>{errorMessage}</p>
                        {fieldErrors.length > 0 && (
                            <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.2rem", fontSize: "0.88rem" }}>
                                {fieldErrors.map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <Input
                        id="admin-email"
                        label="Admin Email / Login ID"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="admin@ratingplatform.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                    />

                    <div className="password-field">
                        <Input
                            id="admin-password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            placeholder="Enter administrator password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <button
                            className="password-toggle"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <Button type="submit" className="button--full" disabled={isSubmitting}>
                        {isSubmitting ? "Authenticating..." : "Login to Admin Portal"}
                    </Button>
                </form>

                <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--line)", paddingTop: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
                    <p style={{ margin: 0, color: "var(--muted)" }}>
                        Standard User or Store Owner?{" "}
                        <Link to="/login" style={{ color: "var(--brand-dark)", fontWeight: 700 }}>
                            Standard Login
                        </Link>
                    </p>
                </div>
            </Card>
        </section>
    );
}

export default AdminLoginPage;
