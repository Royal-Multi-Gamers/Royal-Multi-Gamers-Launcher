import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar";
import { TabBackground } from "@/components/layout/TabBackground";
import { TitleBar } from "@/components/layout/TitleBar";
import type { TabConfig } from "@/lib/types";

interface AppShellProps {
  tabs: TabConfig[];
  currentTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function AppShell({ tabs, currentTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="relative isolate flex h-screen w-screen flex-col overflow-hidden">
      <TabBackground background={tabs.find((tab) => tab.id === currentTab)?.background} />
      <TitleBar />
      <NavBar tabs={tabs} currentTab={currentTab} onTabChange={onTabChange} />
      <main className="flex-1 overflow-y-auto p-4">{children}</main>
      <Footer />
    </div>
  );
}
