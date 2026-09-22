import { DownloadCloud } from "lucide-react";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpdater } from "@/hooks/use-updater";

async function openUpdaterWindow() {
  const updaterWindow = new WebviewWindow("updater", {
    url: "index.html?updater",
    title: "Royal Multi Gamers Launcher - Mise à jour",
    width: 420,
    height: 280,
    resizable: false,
    decorations: false,
    center: true,
    alwaysOnTop: true,
    visible: false,
    backgroundColor: "#08090b",
  });

  updaterWindow.once("tauri://created", () => {
    getCurrentWindow().close();
  });
}

export function UpdateOverlay() {
  const { status, version } = useUpdater();

  if (status !== "available") return null;

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
          <Button onClick={openUpdaterWindow} className="w-full">
            Installer et redémarrer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
