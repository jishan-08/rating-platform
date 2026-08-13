import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import { EmptyState } from "../components/StatusState";

function DashboardShellPage() {
    return <div className="dashboard-page">
        <PageHeader eyebrow="Workspace" title="Dashboard shell"><p>This shared structure is ready for role-specific experiences once API integration begins.</p></PageHeader>
        <div className="dashboard-cards">
            <Card><h2>Admin</h2><p>Manage users, store owners, and store records.</p></Card>
            <Card><h2>User</h2><p>Discover stores and manage your submitted ratings.</p></Card>
            <Card><h2>Store owner</h2><p>Review your store information and rating insights.</p></Card>
        </div>
        <EmptyState title="No dashboard data yet">Sign-in and API data will be added in a later module.</EmptyState>
    </div>;
}

export default DashboardShellPage;
