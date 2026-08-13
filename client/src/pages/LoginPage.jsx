import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";

function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        setMessage("Login will be connected to the API in a later step.");
    }

    return <section className="auth-page page-container"><Card className="auth-card">
        <p className="eyebrow">Welcome back</p><h1>Login to your account</h1>
        <p className="auth-intro">Use your Rating Platform credentials to continue.</p>
        {message && <p className="form-message" role="status">{message}</p>}
        <form onSubmit={handleSubmit} noValidate>
            <Input id="login-email" label="Email address" type="email" autoComplete="email" required placeholder="you@example.com" />
            <div className="password-field"><Input id="login-password" label="Password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
                <button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div>
            <Button type="submit" className="button--full">Login</Button>
        </form>
        <p className="auth-switch">New to Rating Platform? <Link to="/register">Create an account</Link>.</p>
    </Card></section>;
}

export default LoginPage;
