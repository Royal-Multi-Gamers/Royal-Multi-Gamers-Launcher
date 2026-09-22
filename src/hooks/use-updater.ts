import { useCallback, useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";

export type UpdaterStatus = "idle" | "checking" | "available" | "error";

const IS_STORE_BUILD = import.meta.env.VITE_STORE_BUILD === "1";
const IS_DEMO = import.meta.env.VITE_UPDATER_DEMO === "1";

export function useUpdater() {
  const [status, setStatus] = useState<UpdaterStatus>("idle");
  const [version, setVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdate = useCallback(async () => {
    if (IS_STORE_BUILD) return;
    if (IS_DEMO) {
      setVersion("9.9.9");
      setStatus("available");
      return;
    }
    setStatus("checking");
    setError(null);
    try {
      const update = await check();
      if (update) {
        setVersion(update.version);
        setStatus("available");
      } else {
        setStatus("idle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  return { status, version, error, checkForUpdate };
}
