import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useAuth } from "../context/useAuth";

function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, Password] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState([]);

    // Optional success message passed via navigation (e.g. after registration)
    const successMessage = location.state?.successMessage || "";
    const redirectPath = location.state?.from?.pathname || "/dashboard";

    // If already logged in, redirect declaratively
    if (isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setFieldErrors([]);

        // Client-side quick check
        if (!email.trim() || !password) {
            setErrorMessage("Please enter both email address and password.");
            return;
        }

        setIsSubmitting(true);

        try {
            await login({ email: email.trim(), password });
            navigate(redirectPath, { replace: true });
        } catch (err) {
            setErrorMessage(err.message || "Failed to log in. Please check your credentials.");
            if (Array.isArray(err.errors)) {
                setFieldErrors(err.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="auth-page page-container">
            <Card className="auth-card">
                <p className="eyebrow">Welcome back</p>
                <h1>Login to your account</h1>
                <p className="auth-intro">Use your Rating Platform credentials to continue.</p>

                {successMessage && (
                    <p className="form-message" role="status">
                        {successMessage}
                    </p>
                )}

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
                        id="login-email"
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                    />

                    <div className="password-field">
                        <Input
                            id="login-password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => Password(e.target.value)}
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
                        {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                </form>

                <p className="auth-switch">
                    New to Rating Platform? <Link to="/register">Create an account</Link>.
                </p>
            </Card>
        </section>
    );
}

export default LoginPage;
