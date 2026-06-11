import { useState } from "react";
import { Check, Loader2, MapPin, Play, Signal, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { connectToServer } from "@/lib/connect";
import { serverKey } from "@/lib/server";
import { cn } from "@/lib/utils";
import type { ServerConfig, ServerStatus } from "@/lib/types";

interface ServerCardProps {
  config: ServerConfig;
  status?: ServerStatus;
}

type ConnectState = "idle" | "connecting" | "success" | "error";

export function ServerCard({ config, status }: ServerCardProps) {
  const [connectState, setConnectState] = useState<ConnectState>("idle");

  const checking = !status;
  const online = status?.online ?? false;
  const name = status?.name ?? config.name ?? serverKey(config);

  async function handlePlay() {
    if (!status || !online || connectState !== "idle") return;
    setConnectState("connecting");
    const success = await connectToServer(status);
    setConnectState(success ? "success" : "error");
    setTimeout(() => setConnectState("idle"), success ? 3000 : 2000);
  }

  return (
    <Card size="sm">
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className={cn(
                checking && "border-warning/30 bg-warning/10 text-warning",
                !checking && online && "border-success/30 bg-success/10 text-success",
                !checking && !online && "border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              {checking ? "Vérification..." : online ? "En ligne" : "Hors ligne"}
            </Badge>
            {!checking && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {status.players}/{status.maxPlayers}
              </span>
            )}
            {!checking && online && status.map !== "N/A" && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {status.map}
              </span>
            )}
            {!checking && status.ping > 0 && (
              <span className="inline-flex items-center gap-1">
                <Signal className="size-3.5" />
                {status.ping}ms
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          disabled={checking || !online || connectState !== "idle"}
          onClick={handlePlay}
          className="min-w-32"
        >
          {connectState === "connecting" ? (
            <Loader2 className="animate-spin" />
          ) : connectState === "success" ? (
            <Check />
          ) : connectState === "error" ? (
            <X />
          ) : (
            <Play />
          )}
          {connectState === "connecting"
            ? "Connexion..."
            : connectState === "success"
              ? "Connecté !"
              : connectState === "error"
                ? "Erreur"
                : checking
                  ? "Vérification..."
                  : online
                    ? "Rejoindre"
                    : "Hors ligne"}
        </Button>
      </CardContent>
    </Card>
  );
}
