import { Users } from "lucide-react";
import { NewsCard } from "@/components/NewsCard";
import { ServerCard } from "@/components/ServerCard";
import { serverKey } from "@/lib/server";
import type { NewsArticle, ServerStatus, TabConfig } from "@/lib/types";

interface TabPageProps {
  tab: TabConfig;
  statuses: Record<string, ServerStatus> | undefined;
  news: NewsArticle[] | undefined;
  totalPlayersAllGames?: number;
}

export function TabPage({ tab, statuses, news, totalPlayersAllGames }: TabPageProps) {
  const hasServers = tab.servers.length > 0;
  const tabStatuses = tab.servers.map((server) => statuses?.[serverKey(server)]);
  const totalPlayers = tabStatuses.reduce((sum, status) => sum + (status?.players ?? 0), 0);
  const onlineCount = tabStatuses.filter((status) => status?.online).length;
  const showGlobal = tab.id === "association" && totalPlayersAllGames !== undefined;
  const players = showGlobal ? totalPlayersAllGames : totalPlayers;

  const heroImage = news?.find((article) => article.image?.startsWith("https://"))?.image;

  return (
    <div className="flex flex-col gap-6">
      <section className="relative isolate overflow-hidden rounded-3xl border border-border/60">
        {heroImage ? (
          <img src={heroImage} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        ) : (
          <div className="hero-fallback absolute inset-0 -z-20" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />

        <div className="grid min-h-[360px] gap-6 p-8 md:grid-cols-[1fr_380px] md:items-end">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs font-semibold tracking-[0.3em] text-foreground/80 uppercase">
              Royal Multi Gamers ·{" "}
              {hasServers ? `${tab.servers.length} serveur${tab.servers.length > 1 ? "s" : ""}` : "Communauté"}
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight">{tab.name}</h1>
            {(hasServers || showGlobal) && (
              <p className="flex items-center gap-2 font-semibold text-foreground/85">
                <Users className="size-4 text-primary" />
                {players} joueur{players > 1 ? "s" : ""} en ligne
                {showGlobal && " sur tous les jeux"}
                {hasServers && ` · ${onlineCount}/${tab.servers.length} serveurs actifs`}
              </p>
            )}
          </div>

          {hasServers && (
            <div className="glass flex max-h-[420px] flex-col gap-2 rounded-2xl p-4 pr-2">
              <h2 className="px-1 pb-1 text-sm font-bold">Serveurs</h2>
              {/* Scroll inside padding so scrollbar stays clear of rounded corners. */}
              <div className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-2">
                {tab.servers.map((server) => (
                  <ServerCard key={serverKey(server)} config={server} status={statuses?.[serverKey(server)]} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {news && news.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="w-fit border-b-2 border-primary pb-1.5 text-lg font-bold">Actualités</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {news.map((article, index) => (
              <NewsCard key={`${article.title}-${index}`} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
