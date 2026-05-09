import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import HR from "../pages/HR";
import Finance from "../pages/Finance";
import SupplyChain from "../pages/SupplyChain";
import Layout from "../shared/components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import { paths } from "../shared/constants/routes";

const routes = createBrowserRouter([
  {
    path: paths.root,
    element: <Auth />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: paths.dashboard,
            element: <Dashboard />,
          },
          {
            path: "/hr",
            element: <HR />,
          },
          {
            path: "/finance",
            element: <Finance />,
          },
          {
            path: "/supply-chain",
            element: <SupplyChain />,
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
    path: "*",
    element: <Navigate to={paths.root} replace />,
  },
]);

export default routes;