import React from "react";
import { createBrowserRouter } from "react-router";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

export default routes;
