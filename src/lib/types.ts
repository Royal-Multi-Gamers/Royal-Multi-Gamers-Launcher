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
}

export interface NewsData {
  articles: NewsArticle[];
}
