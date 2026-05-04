import React from "react";
import { createBrowserRouter, Navigate } from "react-router"; // Correct v7 import
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import Layout from "../shared/components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import { paths } from "../shared/constants/routes";

const routes = createBrowserRouter([
  {
    path: paths.root,
    element: <Auth />,
  },
  {
    // All routes inside this object require a login token
    element: <ProtectedRoute />, 
    children: [
      {
        // All routes inside here will display the Sidebar and Topbar
        element: <Layout />, 
        children: [
          {
            path: paths.dashboard,
            element: <Dashboard />,
          },
          {
            path: "/hr",
            element: <div style={{ padding: '20px' }}><h1>HR Management</h1></div>,
          },
          {
            path: "/finance",
            element: <div style={{ padding: '20px' }}><h1>Finance & Accounts</h1></div>,
          },
          {
            path: "/supply-chain",
            element: <div style={{ padding: '20px' }}><h1>Supply Chain</h1></div>,
          },
          {
            path: "/projects",
            element: <div style={{ padding: '20px' }}><h1>Project Management</h1></div>,
          },
          {
            path: "/settings",
            element: <div style={{ padding: '20px' }}><h1>Settings</h1></div>,
          },
        ],
      },
    ],
  },
  {
    // Catch-all: Send unknown URLs back to login or dashboard
    path: "*",
    element: <Navigate to={paths.root} replace />,
  },
]);

export default routes;