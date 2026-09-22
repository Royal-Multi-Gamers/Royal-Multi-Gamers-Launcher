import { useEffect, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { getCurrentWindow } from "@tauri-apps/api/window";

const IS_DEMO = import.meta.env.VITE_UPDATER_DEMO === "1";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function UpdaterWindow() {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("Recherche de la mise à jour...");

  useEffect(() => {
    const appWindow = getCurrentWindow();
    appWindow.show();
    appWindow.setFocus();

    (async () => {
      try {
        if (IS_DEMO) {
          setLabel("Téléchargement...");
          for (let p = 0; p <= 100; p += 10) {
            setProgress(p);
            await sleep(200);
          }
          setLabel("Redémarrage...");
          return;
        }

        const update = await check();
        if (!update) {
          await appWindow.close();
          return;
        }

        setLabel("Téléchargement...");
        let downloaded = 0;
        let total = 0;

        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case "Started":
              total = event.data.contentLength ?? 0;
              break;
            case "Progress":
              downloaded += event.data.chunkLength;
              if (total > 0) setProgress(Math.min(100, Math.round((downloaded / total) * 100)));
              break;
            case "Finished":
              setProgress(100);
              break;
          }
        });

        setLabel("Redémarrage...");
        await relaunch();
      } catch (err) {
        setLabel(`Erreur: ${err instanceof Error ? err.message : String(err)}`);
      }
    })();
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-background">
      <img src="/logo.png" alt="Royal Multi Gamers" className="size-16 rounded-xl" />
      <div className="flex flex-col items-center gap-2">
        <p className="text-base font-medium text-foreground">Mise à jour en cours...</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <div className="h-1.5 w-64 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
