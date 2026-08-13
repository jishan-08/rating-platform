import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";

function RegisterPage() {
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        if (form.get("password") !== form.get("confirmPassword")) {
            setMessage(""); setError("Password confirmation must match your password."); return;
        }
        setError(""); setMessage("Registration will be connected to the API in a later step.");
    }

    return <section className="auth-page page-container"><Card className="auth-card">
        <p className="eyebrow">Create your account</p><h1>Join Rating Platform</h1>
        <p className="auth-intro">Public registrations create a standard user account.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-message" role="status">{message}</p>}
        <form onSubmit={handleSubmit} noValidate>
            <Input id="register-name" name="name" label="Full name" autoComplete="name" required hint="20–60 characters" />
            <Input id="register-email" name="email" label="Email address" type="email" autoComplete="email" required />
            <Input id="register-address" name="address" label="Address" autoComplete="street-address" required />
            <Input id="register-password" name="password" label="Password" type="password" autoComplete="new-password" required hint="At least 8 characters" />
            <Input id="register-confirm-password" name="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" required />
            <Button type="submit" className="button--full">Create account</Button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link>.</p>
    </Card></section>;
}

export default RegisterPage;
