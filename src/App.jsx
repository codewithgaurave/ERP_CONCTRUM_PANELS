// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import PublicEmployeeForm from "./pages/PublicEmployeeForm";
import { Toaster } from "sonner";
import { getRoutesByRole, getCommonRoutes } from "./routes";
import { toast } from "sonner";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading HR Panel...</p>
    </div>
  </div>
);

function App() {
  const { user, isLoggedIn, loading } = useAuth();

  // Check if user has valid role
  const isValidRole = user && ["HR_Manager", "Team_Leader", "Employee"].includes(user.role);

  useEffect(() => {
    if (isLoggedIn && !isValidRole) {
      toast.error("You don't have permission to access this application. Please contact administrator.");
    }
  }, [isLoggedIn, isValidRole]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Public Employee Application Form */}
        <Route path="/apply/:token" element={<PublicEmployeeForm />} />

        {/* Protected Routes */}
        {isLoggedIn && isValidRole ? (
          <Route element={<DashboardLayout />}>
            {/* Common routes for all roles */}
            {getCommonRoutes().map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Component />
                  </Suspense>
                }
              />
            ))}
            
            {/* Role-specific routes */}
            {getRoutesByRole(user?.role).map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Component />
                  </Suspense>
                }
              />
            ))}
            
            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          // Redirect to login if not logged in or invalid role
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;