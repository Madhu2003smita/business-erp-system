import React from "react";
import { createBrowserRouter } from "react-router";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import { paths } from "../shared/constants/routes";
import ProtectedRoute from "./ProtectedRoute";

const routes = createBrowserRouter([
  {
    path: paths.root,
    element: <Auth />,
  },
  {
    path: paths.dashboard,
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

export default routes;
