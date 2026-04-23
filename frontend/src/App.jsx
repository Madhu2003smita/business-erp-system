import React from "react";
import "./App.css";
import routes from "./routes";
import { RouterProvider } from "react-router/dom";

export const App = () => {
  return (
    <div className="main-container">
      <RouterProvider router={routes} />
    </div>
  );
};
export default App;
