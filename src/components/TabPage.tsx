import { Users } from "lucide-react";
import { NewsCard } from "@/components/NewsCard";
import { ServerCard } from "@/components/ServerCard";
import { Badge } from "@/components/ui/badge";
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
  const totalPlayers = tab.servers.reduce((sum, server) => {
    const status = statuses?.[serverKey(server)];
    return sum + (status?.players ?? 0);
  }, 0);

  const showGlobalBadge = tab.id === "association" && totalPlayersAllGames !== undefined;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{tab.name}</h1>
        {hasServers && (
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
            <Users className="size-4" />
            {totalPlayers} joueur{totalPlayers > 1 ? "s" : ""} en ligne
          </Badge>
        )}
        {showGlobalBadge && (
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
            <Users className="size-4" />
            {totalPlayersAllGames} joueur{totalPlayersAllGames > 1 ? "s" : ""} en ligne sur tous les jeux
          </Badge>
        )}
      </header>

      {hasServers && (
        <div className="flex flex-col gap-3">
          {tab.servers.map((server) => (
            <ServerCard key={serverKey(server)} config={server} status={statuses?.[serverKey(server)]} />
          ))}
        </div>
      )}

      {news && news.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {news.map((article, index) => (
            <NewsCard key={`${article.title}-${index}`} article={article} featured={index === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
