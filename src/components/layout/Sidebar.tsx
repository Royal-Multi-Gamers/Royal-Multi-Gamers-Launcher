import { openUrl } from "@tauri-apps/plugin-opener";
import { ChevronsLeft, ChevronsRight, Globe, Moon, Sun } from "lucide-react";
import { DiscordIcon } from "@/components/icons/discord-icon";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { DISCORD_URL, WEBSITE_URL } from "@/lib/constants";
import { getTabIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { TabConfig } from "@/lib/types";

interface SidebarProps {
  tabs: TabConfig[];
  currentTab: string;
  onTabChange: (tabId: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function Sidebar({ tabs, currentTab, onTabChange, collapsed, onToggleCollapsed }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 px-3">
        <img src="/logo.png" alt="Royal Multi Gamers" className="size-8 shrink-0 rounded-md" />
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-wide text-sidebar-foreground">
            Royal Multi Gamers
          </span>
        )}
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {tabs.map((tab) => {
          const Icon = getTabIcon(tab.icon);
          const isActive = tab.id === currentTab;
          const button = (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className={cn("size-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && <span className="truncate">{tab.name}</span>}
            </button>
          );

          if (!collapsed) return button;

          return (
            <Tooltip key={tab.id}>
              <TooltipTrigger render={button} />
              <TooltipContent side="right">{tab.name}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className={cn("flex flex-col gap-2 p-2", collapsed && "items-center")}>
        <div className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5", collapsed && "flex-col gap-1.5 px-0")}>
          {theme === "dark" ? (
            <Moon className="size-4 shrink-0 text-sidebar-foreground/70" />
          ) : (
            <Sun className="size-4 shrink-0 text-sidebar-foreground/70" />
          )}
          {!collapsed && <span className="flex-1 text-xs text-sidebar-foreground/70">Thème sombre</span>}
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} aria-label="Basculer le thème" />
        </div>

        <div className={cn("flex gap-2", collapsed ? "flex-col items-center" : "flex-row")}>
          <SocialButton
            icon={<DiscordIcon className="size-4" />}
            label="Discord"
            onClick={() => openUrl(DISCORD_URL)}
            collapsed={collapsed}
          />
          <SocialButton
            icon={<Globe className="size-4" />}
            label="Site web"
            onClick={() => openUrl(WEBSITE_URL)}
            collapsed={collapsed}
          />
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Agrandir le menu" : "Réduire le menu"}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              !collapsed && "ml-auto",
            )}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}

function SocialButton({
  icon,
  label,
  onClick,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  collapsed: boolean;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {icon}
    </button>
  );

  if (!collapsed) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
