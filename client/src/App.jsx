import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardShellPage from "./pages/DashboardShellPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public routes wrapped in AppLayout */}
                <Route element={<AppLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                </Route>

                {/* Protected customer/store-owner dashboard workspace routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["USER", "STORE_OWNER"]}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardShellPage />} />
                </Route>

                {/* Protected administrator dashboard workspace routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboardPage />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}

export default App;
