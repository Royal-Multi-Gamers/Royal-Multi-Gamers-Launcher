import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { FALLBACK_NEWS, NEWS_BASE_URL } from "@/lib/constants";
import type { NewsArticle, TabConfig } from "@/lib/types";

type NewsByTab = Record<string, NewsArticle[]>;

const CACHE_KEY = "cache:news";
const REFRESH_MS = 5 * 60 * 1000;

function fallbackFor(tabId: string): NewsArticle[] {
  return FALLBACK_NEWS[tabId] ?? FALLBACK_NEWS.association;
}

function readCache(): NewsByTab {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as NewsByTab;
  } catch {
    return {};
  }
}

function withFallback(byTab: NewsByTab): NewsByTab {
  return Object.fromEntries(
    Object.entries(byTab).map(([id, articles]) => [id, articles.length > 0 ? articles : fallbackFor(id)]),
  );
}

async function fetchTab(tabId: string): Promise<NewsArticle[]> {
  const raw = await invoke<string>("fetch_json", { url: `${NEWS_BASE_URL}${tabId}.json` });
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
  articles.sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
  return articles;
}

export function useNews(tabs: TabConfig[] | null): NewsByTab {
  const [news, setNews] = useState<NewsByTab>(() => withFallback(readCache()));
  // Depend on tab ids only, so a config refresh with the same tabs doesn't refetch twice.
  const tabIds = tabs?.map((tab) => tab.id).join(",") ?? "";

  useEffect(() => {
    if (!tabIds) return;
    let cancelled = false;

    async function load() {
      const cache = readCache();
      const entries = await Promise.all(
        tabIds.split(",").map(async (id): Promise<[string, NewsArticle[]]> => {
          try {
            return [id, await fetchTab(id)];
          } catch (error) {
            console.warn(`Failed to load news for ${id}, using cache:`, error);
            return [id, cache[id] ?? []];
          }
        }),
      );

      const fresh = Object.fromEntries(entries);
      localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
      if (!cancelled) setNews(withFallback(fresh));
    }

    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tabIds]);

  return news;
}
