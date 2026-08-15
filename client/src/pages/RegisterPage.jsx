import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useAuth } from "../context/useAuth";

function RegisterPage() {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState([]);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setFieldErrors([]);

        const { name, email, address, password, confirmPassword } = formData;
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedAddress = address.trim();

        // Client-side validations matching database constraints
        const clientErrors = [];
        if (!trimmedName || trimmedName.length > 60) {
            clientErrors.push("Full name is required and cannot exceed 60 characters.");
        }
        if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            clientErrors.push("A valid email address is required.");
        }
        if (!trimmedAddress || trimmedAddress.length > 400) {
            clientErrors.push("Address is required and must be under 400 characters.");
        }
        if (password.length < 8) {
            clientErrors.push("Password must be at least 8 characters long.");
        }
        if (password !== confirmPassword) {
            clientErrors.push("Password confirmation does not match.");
        }

        if (clientErrors.length > 0) {
            setErrorMessage("Please correct the following errors before continuing:");
            setFieldErrors(clientErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                name: trimmedName,
                email: trimmedEmail,
                address: trimmedAddress,
                password,
            });

            // On success, navigate to login with flash notification
            navigate("/login", {
                state: {
                    successMessage: "Account created successfully! Please log in with your credentials.",
                },
            });
        } catch (err) {
            setErrorMessage(err.message || "Failed to create account. Please try again.");
            if (Array.isArray(err.errors) && err.errors.length > 0) {
                setFieldErrors(err.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="auth-page page-container">
            <Card className="auth-card">
                <p className="eyebrow">Create your account</p>
                <h1>Join Rating Platform</h1>
                <p className="auth-intro">Public registration creates a standard customer account.</p>

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
                        id="register-name"
                        name="name"
                        label="Full name"
                        autoComplete="name"
                        required
                        hint="Maximum 60 characters"
                        placeholder="Full name (e.g. John Doe)"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    />

                    <Input
                        id="register-email"
                        name="email"
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    />

                    <Input
                        id="register-address"
                        name="address"
                        label="Address"
                        autoComplete="street-address"
                        required
                        hint="Up to 400 characters"
                        placeholder="Your residential address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    />

                    <div className="password-field">
                        <Input
                            id="register-password"
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            hint="At least 8 characters"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
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

                    <Input
                        id="register-confirm-password"
                        name="confirmPassword"
                        label="Confirm password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    />

                    <Button type="submit" className="button--full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </Button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>.
                </p>
            </Card>
        </section>
    );
}

export default RegisterPage;
