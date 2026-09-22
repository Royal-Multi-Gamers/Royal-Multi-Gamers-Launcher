import { useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ExternalLink, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GITHUB_RELEASES_URL } from "@/lib/constants";

const IS_STORE_BUILD = import.meta.env.VITE_STORE_BUILD === "1";

export function StoreBuildNoticeButton() {
  const [open, setOpen] = useState(false);

  if (!IS_STORE_BUILD) return null;

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="À propos de cette version"
      className="fixed bottom-4 right-4 z-40 inline-flex size-10 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-500 shadow-lg ring-1 ring-yellow-500/30 transition-colors hover:bg-yellow-500/25"
    >
      <Shield className="size-5" />
    </button>
  );

  return (
    <>
      <Tooltip>
        <TooltipTrigger render={trigger} />
        <TooltipContent>À propos de cette version</TooltipContent>
      </Tooltip>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative w-[420px] rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-2">
              <Shield className="size-5 text-yellow-500" />
              <h2 className="font-heading text-base font-medium">Version Microsoft Store</h2>
            </div>

            <p className="mt-3 text-sm text-muted-foreground">
              Cette version ne se met pas à jour automatiquement. Seule la version distribuée
              sur GitHub dispose de la mise à jour automatique.
            </p>

            <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
              <li>
                Microsoft impose que les mises à jour passent par le Store, ce qui ralentit leur
                diffusion.
              </li>
              <li>
                La version GitHub reçoit les derniers correctifs et nouveautés en
                avant-première, dès leur publication.
              </li>
              <li>
                La version Store peut donc afficher un retard par rapport à la version GitHub.
              </li>
            </ul>

            <Button className="mt-4 w-full" onClick={() => openUrl(GITHUB_RELEASES_URL)}>
              <ExternalLink data-icon="inline-start" />
              Voir les releases sur GitHub
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
