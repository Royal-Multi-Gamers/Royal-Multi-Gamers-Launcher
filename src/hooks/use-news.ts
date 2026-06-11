import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { FALLBACK_NEWS, NEWS_BASE_URL } from "@/lib/constants";
import type { NewsArticle, TabConfig } from "@/lib/types";

type NewsByTab = Record<string, NewsArticle[]>;

function fallbackFor(tabId: string): NewsArticle[] {
  return FALLBACK_NEWS[tabId] ?? FALLBACK_NEWS.association;
}

export function useNews(tabs: TabConfig[] | null): NewsByTab {
  const [news, setNews] = useState<NewsByTab>({});

  useEffect(() => {
    if (!tabs || tabs.length === 0) return;
    let cancelled = false;

    async function load() {
      const entries = await Promise.all(
        tabs!.map(async (tab): Promise<[string, NewsArticle[]]> => {
          const url = `${NEWS_BASE_URL}${tab.id}.json`;
          try {
            const raw = await invoke<string>("fetch_json", { url });
            let data = JSON.parse(raw) as { title?: string; body?: string; articles?: NewsArticle[] };

            if (data.title && data.body) {
              data = {
                articles: [
                  {
                    title: data.title,
                    content: data.body,
                    date: new Date().toISOString(),
                    author: "Admin",
                  },
                ],
              };
            }

            const articles = data.articles ?? [];
            if (articles.length > 0 && articles[0].date !== undefined) {
              articles.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
            }

            return [tab.id, articles.length > 0 ? articles : fallbackFor(tab.id)];
          } catch (error) {
            console.warn(`Failed to load news for ${tab.id}:`, error);
            return [tab.id, fallbackFor(tab.id)];
          }
        }),
      );

      if (!cancelled) setNews(Object.fromEntries(entries));
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tabs]);

  return news;
}
