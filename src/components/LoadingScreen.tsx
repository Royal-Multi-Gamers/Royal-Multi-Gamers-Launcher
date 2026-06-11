import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
      <img src="/logo.png" alt="Royal Multi Gamers" className="size-16 rounded-xl" />
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Chargement du launcher...</p>
    </div>
  );
}
