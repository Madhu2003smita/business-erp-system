import React from "react";
import { Navigate, Outlet } from "react-router"; // Updated to 'react-router' and added Outlet

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // If no token exists, redirect to the login/root page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Instead of returning {children}, we use <Outlet />.
  // This is the "window" where Dashboard, HR, Finance, etc., will render.
  return <Outlet />;
};

export default ProtectedRoute;