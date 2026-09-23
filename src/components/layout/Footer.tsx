import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";

export function Footer() {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    getVersion().then(setVersion).catch(() => setVersion(null));
  }, []);

  return (
    <footer className="flex h-8 shrink-0 items-center justify-center border-t border-border/60 bg-card/40 px-4 text-center text-xs text-muted-foreground backdrop-blur-sm">
      <p>
        © Clan RmG .:. Royal Multi Gamers - Association sous loi 1901 .:. 2009-{new Date().getFullYear()}
        {version && ` .:. v${version}`}
      </p>
    </footer>
  );
}
