export interface ServerConfig {
  name?: string;
  ip?: string;
  port?: string;
  queryPort?: string;
  type: string;
  protocol: string;
}

export interface TabConfig {
  id: string;
  name: string;
  icon: string;
  servers: ServerConfig[];
  isDefault?: boolean;
  background?: TabBackground;
}

export interface TabBackground {
  /** https URL of the image shown behind the whole window for this tab. */
  image: string;
  /** Blur radius in px (0-40, default 12). */
  blur?: number;
  /** Brightness 0-1, lower = darker (default 0.45). */
  brightness?: number;
  /** Saturation 0-2 (default 1.1). */
  saturate?: number;
}

export interface LauncherConfig {
  tabs: TabConfig[];
}

export interface ServerStatus {
  configKey: string;
  name: string;
  ip?: string;
  port?: string;
  protocol: string;
  online: boolean;
  players: number;
  maxPlayers: number;
  map: string;
  ping: number;
}

export interface ServerUpdatePayload {
  gameType: string;
  server: ServerStatus;
}

export interface NewsArticle {
  title: string;
  content?: string;
  description?: string;
  date?: string;
  author?: string;
  image?: string;
  /** Optional "read more" URL; only https links are opened. */
  link?: string;
}
