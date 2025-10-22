import { Navigate, Outlet } from "react-router-dom";

const AuthRoute = () => {
  const token = localStorage.getItem("token");

  if (token) {
    // User already logged in, redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthRoute;
