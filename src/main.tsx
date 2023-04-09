import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = document.createElement("div");
root.id = "root-bruna";
document.body.appendChild(root);

console.log("aaa");

ReactDOM.createRoot(root as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
