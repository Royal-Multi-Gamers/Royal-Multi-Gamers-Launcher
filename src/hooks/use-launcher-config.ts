import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { CONFIG_URL, FALLBACK_CONFIG } from "@/lib/constants";
import type { LauncherConfig } from "@/lib/types";

interface UseLauncherConfigResult {
  config: LauncherConfig | null;
  loading: boolean;
}

export function useLauncherConfig(): UseLauncherConfigResult {
  const [config, setConfig] = useState<LauncherConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const raw = await invoke<string>("fetch_json", { url: CONFIG_URL });
        const parsed = JSON.parse(raw) as LauncherConfig;
        if (!cancelled) setConfig(parsed);
      } catch (error) {
        console.error("Error fetching launcher config:", error);
        if (!cancelled) setConfig(FALLBACK_CONFIG);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading };
}
