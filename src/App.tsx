import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingScreen } from "@/components/LoadingScreen";
import { TabPage } from "@/components/TabPage";
import { UpdateOverlay } from "@/components/UpdateOverlay";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { useLauncherConfig } from "@/hooks/use-launcher-config";
import { useNews } from "@/hooks/use-news";
import { useServerStatus } from "@/hooks/use-server-status";
import type { ServerConfig } from "@/lib/types";

function AppContent() {
  const { config, loading } = useLauncherConfig();
  const news = useNews(config?.tabs ?? null);
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  const serversByTab = useMemo(() => {
    if (!config) return null;
    const map: Record<string, ServerConfig[]> = {};
    for (const tab of config.tabs) {
      if (tab.servers.length > 0) map[tab.id] = tab.servers;
    }
    return map;
  }, [config]);

  const statuses = useServerStatus(serversByTab);

  const totalPlayersAllGames = useMemo(() => {
    let total = 0;
    for (const tabStatuses of Object.values(statuses)) {
      for (const status of Object.values(tabStatuses)) {
        total += status.players;
      }
    }
    return total;
  }, [statuses]);

  useEffect(() => {
    if (!config || currentTab !== null) return;
    const defaultTab = config.tabs.find((tab) => tab.isDefault)?.id ?? config.tabs[0]?.id;
    if (defaultTab) setCurrentTab(defaultTab);
  }, [config, currentTab]);

  if (loading || !config || !currentTab) return <LoadingScreen />;

  const activeTab = config.tabs.find((tab) => tab.id === currentTab) ?? config.tabs[0];

  return (
    <AppShell tabs={config.tabs} currentTab={activeTab.id} onTabChange={setCurrentTab}>
      <TabPage
        tab={activeTab}
        statuses={statuses[activeTab.id]}
        news={news[activeTab.id]}
        totalPlayersAllGames={totalPlayersAllGames}
      />
      <UpdateOverlay />
    </AppShell>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
