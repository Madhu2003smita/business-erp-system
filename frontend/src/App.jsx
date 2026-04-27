import React from "react";
import "./App.css";
import routes from "./routes";
import { RouterProvider } from "react-router/dom";
import { GooeyToaster } from "goey-toast";

export const App = () => {
  return (
    <div className="main-container">
      <RouterProvider router={routes} />
      <GooeyToaster position="top-left" />
    </div>
  );
};
export default App;
