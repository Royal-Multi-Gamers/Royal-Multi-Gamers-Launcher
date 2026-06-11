import { getCurrentWindow } from "@tauri-apps/api/window";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Reveal the window only once the loading screen has actually painted,
// so we never show a blank/black window during WebView startup.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const appWindow = getCurrentWindow();
    appWindow.show();
    appWindow.setFocus();
  });
});
