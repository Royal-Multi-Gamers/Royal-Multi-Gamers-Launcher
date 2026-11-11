import { useRef } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/lib/types";

interface NewsCardProps {
  article: NewsArticle;
}

const httpsOnly = (url?: string) => (url?.startsWith("https://") ? url : null);

export function NewsCard({ article }: NewsCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const date = article.date ? new Date(article.date).toLocaleDateString("fr-FR") : null;
  const summary = article.description ?? article.content ?? "";
  const body = article.content ?? article.description ?? "";
  const safeImage = httpsOnly(article.image);
  const safeLink = httpsOnly(article.link);
  const meta = [date, article.author && `Par ${article.author}`].filter(Boolean).join(" · ");

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="glass group flex flex-col overflow-hidden rounded-2xl text-left transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <div className="relative aspect-video w-full overflow-hidden">
          {safeImage ? (
            <img
              src={safeImage}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="hero-fallback size-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4 text-white">
            <h3 className="text-base leading-tight font-bold">{article.title}</h3>
            {meta && <p className="text-xs font-semibold text-white/75">{meta}</p>}
          </div>
        </div>
        {summary && <p className="line-clamp-3 px-4 pt-4 text-sm text-muted-foreground">{summary}</p>}
        <span className="p-4 pt-2 text-xs font-semibold text-primary">Lire la suite →</span>
      </button>

      {/* Native <dialog> gives Escape-to-close, focus trapping and the backdrop for free. */}
      <dialog
        ref={dialogRef}
        onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
        aria-label={article.title}
        className="m-auto max-h-[85vh] w-[min(720px,90vw)] overflow-hidden rounded-2xl border border-border/60 bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex max-h-[85vh] flex-col">
          <div className="relative shrink-0">
            {safeImage ? (
              <img src={safeImage} alt="" className="aspect-[21/9] w-full object-cover" />
            ) : (
              <div className="hero-fallback aspect-[21/9] w-full" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Fermer"
              className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <X className="size-4" />
            </button>
            <div className="absolute inset-x-0 bottom-0 px-6 pb-2">
              <h2 className="text-2xl leading-tight font-extrabold">{article.title}</h2>
              {meta && <p className="mt-1 text-sm font-semibold text-muted-foreground">{meta}</p>}
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-4">
            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">{body}</p>
          </div>

          {safeLink && (
            <div className="shrink-0 border-t border-border/60 px-6 py-4">
              <Button onClick={() => openUrl(safeLink)}>
                <ExternalLink data-icon="inline-start" />
                En savoir plus
              </Button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
