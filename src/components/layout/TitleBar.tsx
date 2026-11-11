import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Globe, Minus, Moon, Square, Sun, X } from "lucide-react";
import { DiscordIcon } from "@/components/icons/discord-icon";
import { useTheme } from "@/hooks/use-theme";
import { DISCORD_URL, WEBSITE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const appWindow = getCurrentWindow();

export function TitleBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      data-tauri-drag-region
      className="flex h-11 shrink-0 items-center gap-3 border-b border-border/60 bg-card/50 pl-4 backdrop-blur-xl"
    >
      <div data-tauri-drag-region className="flex flex-1 items-center gap-2.5 truncate">
        <img src="/logo.png" alt="" className="pointer-events-none size-6 rounded" />
        <span className="pointer-events-none text-xs font-bold tracking-[0.25em] uppercase">Royal Multi Gamers</span>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
      <button
        type="button"
        onClick={() => openUrl(DISCORD_URL)}
        className="flex h-7 items-center gap-1.5 rounded-lg bg-[#5865F2] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      >
        <DiscordIcon className="size-3.5" />
        Discord
      </button>
      <button
        type="button"
        onClick={() => openUrl(WEBSITE_URL)}
        className="flex h-7 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Globe className="size-3.5" />
        Site web
      </button>

      <div className="flex h-full items-stretch">
        <TitleBarButton onClick={() => appWindow.minimize()} aria-label="Réduire">
          <Minus className="size-4" />
        </TitleBarButton>
        <TitleBarButton onClick={() => appWindow.toggleMaximize()} aria-label="Agrandir">
          <Square className="size-3.5" />
        </TitleBarButton>
        <TitleBarButton onClick={() => appWindow.close()} aria-label="Fermer" variant="close">
          <X className="size-4" />
        </TitleBarButton>
      </div>
    </header>
  );
}

function TitleBarButton({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "close" }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        variant === "close" && "hover:bg-destructive hover:text-white",
        className,
      )}
      {...props}
    />
  );
}
