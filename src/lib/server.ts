import type { ServerConfig } from "./types";

/** Stable key for a server entry, matching the old launcher's serverKey() helper. */
export function serverKey(server: ServerConfig): string {
  return server.name || `${server.ip}:${server.port}`;
}
