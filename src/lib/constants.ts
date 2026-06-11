import type { LauncherConfig, NewsArticle } from "./types";

export const CONFIG_URL = "https://fastdl.clan-rmg.com/launcher/config.json";
export const NEWS_BASE_URL = "https://fastdl.clan-rmg.com/launcher/news/";

export const DISCORD_URL = "https://discord.gg/tqPtgyk6yT";
export const WEBSITE_URL = "https://clan-rmg.com";

export const SERVER_STATUS_INTERVAL = 30000;

export const FALLBACK_CONFIG: LauncherConfig = {
  tabs: [
    {
      id: "offline",
      name: "Launcher Hors Ligne",
      icon: "wifi",
      servers: [],
      isDefault: true,
    },
  ],
};

export const FALLBACK_NEWS: Record<string, NewsArticle[]> = {
  offline: [
    {
      title: "Erreur de connexion",
      content:
        "Impossible de charger les actualités. Veuillez vérifier votre connexion internet et réessayer.",
      date: new Date().toISOString(),
      author: "Système",
    },
  ],
  association: [
    {
      title: "Bienvenue sur le launcher RMG !",
      content:
        "Découvrez notre nouvelle interface pour accéder à tous vos serveurs de jeux favoris. Le launcher utilise gamedig pour vérifier le statut des serveurs en temps réel.",
      date: new Date().toISOString(),
      author: "Équipe RMG",
    },
    {
      title: "Rejoignez notre Discord",
      content:
        "Connectez-vous avec la communauté RMG sur notre serveur Discord officiel. Cliquez sur le bouton Discord pour nous rejoindre !",
      date: new Date().toISOString(),
      author: "Community Manager",
    },
  ],
  css: [
    {
      title: "Serveurs Counter-Strike Source disponibles",
      content:
        "Nos serveurs CSS sont maintenant disponibles ! Poolparty DeathMatch, Antiroxx et AimDeathMatch vous attendent pour des parties épiques.",
      date: new Date().toISOString(),
      author: "Admin CSS",
    },
  ],
  cs2: [
    {
      title: "Serveur CS2 PoolParty actif",
      content:
        "Le serveur Counter-Strike 2 PooLparty DeathMatch est en ligne. Venez montrer vos compétences !",
      date: new Date().toISOString(),
      author: "Admin CS2",
    },
  ],
  eco: [
    {
      title: "Serveur ECO Nexus Life disponible",
      content:
        "Découvrez ECO sur notre serveur Nexus Life. Construisez une civilisation durable dans ce jeu de simulation écologique !",
      date: new Date().toISOString(),
      author: "Admin ECO",
    },
  ],
  battlebit: [
    {
      title: "Serveur BattleBit RMG disponible !",
      content:
        'Notre serveur BattleBit Remastered est maintenant disponible ! Rejoignez "[FR]Clan-RmG.com | ALL GAMEMODES" pour des batailles épiques avec la communauté RMG.',
      date: new Date().toISOString(),
      author: "Admin BattleBit",
    },
  ],
  rust: [
    {
      title: "Serveur Rust Nexus disponible",
      content: "Découvrez Rust sur notre serveur Nexus. Construisez et survivez !",
      date: new Date().toISOString(),
      author: "Admin Rust",
    },
  ],
};
