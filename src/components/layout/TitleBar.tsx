import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";

const appWindow = getCurrentWindow();

interface TitleBarProps {
  title: string;
}

export function TitleBar({ title }: TitleBarProps) {
  return (
    <header
      data-tauri-drag-region
      className="flex h-10 shrink-0 items-center justify-between border-b border-border/60 bg-card/40 pl-4 backdrop-blur-sm"
    >
      <div data-tauri-drag-region className="flex-1 truncate text-sm font-medium text-muted-foreground">
        {title}
      </div>
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
        "inline-flex w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        variant === "close" && "hover:bg-destructive hover:text-destructive-foreground",
        className,
      )}
      {...props}
    />
  );
}
