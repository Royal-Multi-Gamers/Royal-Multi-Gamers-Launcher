import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";
import { SERVER_STATUS_INTERVAL } from "@/lib/constants";
import type { ServerConfig, ServerStatus, ServerUpdatePayload } from "@/lib/types";

export type ServerStatusMap = Record<string, Record<string, ServerStatus>>;

export function useServerStatus(servers: Record<string, ServerConfig[]> | null): ServerStatusMap {
  const [statuses, setStatuses] = useState<ServerStatusMap>({});
  const checkInProgress = useRef(false);

  useEffect(() => {
    if (!servers || Object.keys(servers).length === 0) return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let unlistenUpdate: (() => void) | undefined;
    let unlistenDone: (() => void) | undefined;

    async function runCheck(isInitialCheck: boolean) {
      if (checkInProgress.current || cancelled) return;
      checkInProgress.current = true;
      try {
        await invoke("check_servers", { servers, isInitialCheck });
      } catch (error) {
        console.error("Error checking servers:", error);
        checkInProgress.current = false;
      }
    }

    async function setup() {
      unlistenUpdate = await listen<ServerUpdatePayload>("server-update", (event) => {
        const { gameType, server } = event.payload;
        setStatuses((prev) => ({
          ...prev,
          [gameType]: {
            ...prev[gameType],
            [server.configKey]: server,
          },
        }));
      });

      unlistenDone = await listen("server-check-done", () => {
        checkInProgress.current = false;
      });

      if (cancelled) return;

      await runCheck(true);
      intervalId = setInterval(() => runCheck(false), SERVER_STATUS_INTERVAL);
    }

    setup();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      unlistenUpdate?.();
      unlistenDone?.();
    };
  }, [servers]);

  return statuses;
}
