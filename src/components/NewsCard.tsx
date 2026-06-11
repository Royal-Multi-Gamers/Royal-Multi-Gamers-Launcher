import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/lib/types";

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
}

export function NewsCard({ article, featured }: NewsCardProps) {
  const date = article.date ? new Date(article.date).toLocaleDateString("fr-FR") : null;
  const content = article.content ?? article.description ?? "";
  const safeImage = article.image?.startsWith("https://") ? article.image : null;

  return (
    <Card className={cn("overflow-hidden", featured && "sm:col-span-2")}>
      {safeImage && (
        <img
          src={safeImage}
          alt={article.title}
          className="aspect-video max-h-64 w-full object-cover"
        />
      )}
      <CardContent className="flex flex-col gap-2">
        <h3 className={cn("font-heading font-semibold", featured ? "text-lg" : "text-base")}>
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground">{content}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          {date && <span>{date}</span>}
          {article.author && <span>Par {article.author}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
