import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
const root = document.createElement("div");
document.body.appendChild(root);
console.log("aaaa");
ReactDOM.createRoot(root as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
