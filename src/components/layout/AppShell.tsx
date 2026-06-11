import { useState, type ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/layout/Sidebar";
import { TitleBar } from "@/components/layout/TitleBar";
import type { TabConfig } from "@/lib/types";

interface AppShellProps {
  tabs: TabConfig[];
  currentTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function AppShell({ tabs, currentTab, onTabChange, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  const activeTab = tabs.find((tab) => tab.id === currentTab);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        tabs={tabs}
        currentTab={currentTab}
        onTabChange={onTabChange}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TitleBar title={activeTab?.name ?? "Royal Multi Gamers Launcher"} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
