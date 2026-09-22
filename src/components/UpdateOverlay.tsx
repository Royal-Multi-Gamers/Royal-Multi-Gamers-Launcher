import { DownloadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdater } from "@/hooks/use-updater";

export function UpdateOverlay() {
  const { status, progress, version, installUpdate } = useUpdater();

  if (status === "idle" || status === "checking" || status === "error") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DownloadCloud className="size-4 text-primary" />
            Mise à jour disponible
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Version {version} prête à être installée.
          </p>
          {status === "downloading" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Téléchargement... {progress}%
            </div>
          ) : (
            <Button onClick={installUpdate} className="w-full">
              Installer et redémarrer
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
