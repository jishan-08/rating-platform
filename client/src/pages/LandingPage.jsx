import Button from "../components/Button";
import Card from "../components/Card";

function LandingPage() {
    return (
        <>
            <section className="hero page-container">
                <div className="hero-copy">
                    <p className="eyebrow">Clearer choices, better experiences</p>
                    <h1>Find places worth your time.</h1>
                    <p className="lead">Rating Platform gives students one focused place to discover stores, share thoughtful ratings, and make informed choices.</p>
                    <div className="hero-actions">
                        <Button to="/login">Login</Button>
                        <Button to="/register" variant="secondary">Create an account</Button>
                    </div>
                </div>
                <Card className="hero-panel">
                    <p className="panel-kicker">Built for clarity</p>
                    <h2>One platform for customers, owners, and administrators.</h2>
                    <ul>
                        <li>Searchable store information</li>
                        <li>Simple, accountable 1–5 ratings</li>
                        <li>Role-aware tools for every participant</li>
                    </ul>
                </Card>
            </section>
            <section className="feature-section"><div className="page-container">
                <p className="eyebrow">How it helps</p>
                <h2 className="section-title">A dependable foundation for better decisions.</h2>
                <div className="feature-grid">
                    <Card><h3>Discover</h3><p>Find relevant stores through clear, useful information.</p></Card>
                    <Card><h3>Rate responsibly</h3><p>Share a single rating that you can revise as your experience changes.</p></Card>
                    <Card><h3>Manage with confidence</h3><p>Dedicated workspaces will help owners and administrators stay informed.</p></Card>
                </div>
            </div></section>
        </>
    );
}

export default LandingPage;
