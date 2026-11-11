import type { TabBackground as TabBackgroundConfig } from "@/lib/types";

// Values come from the remote config: clamp them so a typo cannot break the UI.
const clamp = (value: number | undefined, min: number, max: number, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function TabBackground({ background }: { background?: TabBackgroundConfig }) {
  if (!background?.image?.startsWith("https://")) return null;

  const blur = clamp(background.blur, 0, 40, 12);
  const brightness = clamp(background.brightness, 0, 1, 0.45);
  const saturate = clamp(background.saturate, 0, 2, 1.1);

  return (
    <div
      key={background.image}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden animate-in fade-in duration-700"
    >
      <img
        src={background.image}
        alt=""
        // scale hides the transparent edges the blur creates
        className="size-full scale-110 object-cover"
        style={{ filter: `blur(${blur}px) brightness(${brightness}) saturate(${saturate})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_100%)] opacity-70" />
    </div>
  );
}
