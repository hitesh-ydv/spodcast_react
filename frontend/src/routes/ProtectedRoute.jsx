import { Navigate, Outlet } from "react-router-dom";

// Check if user is logged in
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    // User not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
