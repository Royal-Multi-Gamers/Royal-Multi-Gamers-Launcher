import { getCurrentWindow } from "@tauri-apps/api/window";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UpdaterWindow } from "./UpdaterWindow";
import "./index.css";

const isUpdaterWindow = new URLSearchParams(window.location.search).has("updater");

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {isUpdaterWindow ? <UpdaterWindow /> : <App />}
  </React.StrictMode>,
);

// Reveal the window only once the loading screen has actually painted,
// so we never show a blank/black window during WebView startup.
// The updater window manages its own visibility (see UpdaterWindow.tsx).
if (!isUpdaterWindow) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const appWindow = getCurrentWindow();
      appWindow.show();
      appWindow.setFocus();
    });
  });
}
