import { getTabIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { TabConfig } from "@/lib/types";

interface NavBarProps {
  tabs: TabConfig[];
  currentTab: string;
  onTabChange: (tabId: string) => void;
}

export function NavBar({ tabs, currentTab, onTabChange }: NavBarProps) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-4 pt-3">
      <nav className="glass flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-2xl p-1.5">
        {tabs.map((tab) => {
          const Icon = getTabIcon(tab.icon);
          const isActive = tab.id === currentTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors",
                "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                isActive && "bg-primary/15 text-foreground ring-1 ring-primary/40 hover:bg-primary/15",
              )}
            >
              <Icon className={cn("size-4 shrink-0", isActive && "text-primary")} />
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
