import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { CONFIG_URL, FALLBACK_CONFIG } from "@/lib/constants";
import type { LauncherConfig } from "@/lib/types";

const CACHE_KEY = "cache:launcher-config";
const REFRESH_MS = 5 * 60 * 1000;

interface UseLauncherConfigResult {
  config: LauncherConfig | null;
  loading: boolean;
}

function readCache(): LauncherConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as LauncherConfig) : null;
  } catch {
    return null;
  }
}

export function useLauncherConfig(): UseLauncherConfigResult {
  // Last good config shows instantly; mirror refresh happens in background.
  const [config, setConfig] = useState<LauncherConfig | null>(readCache);
  const [loading, setLoading] = useState(() => config === null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const raw = await invoke<string>("fetch_json", { url: CONFIG_URL });
        const parsed = JSON.parse(raw) as LauncherConfig;
        if (!Array.isArray(parsed.tabs)) throw new Error("config.json has no tabs array");
        // Same content: keep the current object so dependents (server polling, news) don't restart.
        if (raw === localStorage.getItem(CACHE_KEY)) return;
        localStorage.setItem(CACHE_KEY, raw);
        if (!cancelled) setConfig(parsed);
      } catch (error) {
        console.error("Error fetching launcher config:", error);
        if (!cancelled) setConfig((current) => current ?? FALLBACK_CONFIG);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { config, loading };
}
