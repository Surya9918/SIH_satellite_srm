import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {" "}
    <ThemeProvider defaultTheme="dark" storageKey="terrars-theme">
      {" "}
      <App />{" "}
    </ThemeProvider>{" "}
  </React.StrictMode>,
);
