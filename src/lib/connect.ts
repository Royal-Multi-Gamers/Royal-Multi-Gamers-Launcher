import { openUrl } from "@tauri-apps/plugin-opener";
import type { ServerStatus } from "./types";

/** Builds the launch URL for a server, mirroring the old Electron main.js logic. */
function buildConnectUrl(server: ServerStatus): string {
  if (server.protocol === "battlebit") {
    return "steam://rungameid/671860/";
  }

  if (server.protocol === "eco") {
    return `http://${server.ip}:${server.port}`;
  }

  return `steam://connect/${server.ip}:${server.port}`;
}

export async function connectToServer(server: ServerStatus): Promise<boolean> {
  try {
    await openUrl(buildConnectUrl(server));
    return true;
  } catch (error) {
    console.error("Failed to open connect URL:", error);
    return false;
  }
}
