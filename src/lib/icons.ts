import { Gamepad2, icons, type LucideIcon } from "lucide-react";

/** Font Awesome names already used in the remote config, mapped to their lucide equivalent. */
const ALIASES: Record<string, string> = {
  home: "house",
  crosshairs: "crosshair",
  bullseye: "target",
  gun: "swords",
  gamepad: "gamepad-2",
};

/** "gamepad-2" -> "Gamepad2" (lucide.dev names are kebab-case, exports are PascalCase). */
const toPascalCase = (name: string) =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

/** Accepts any icon name from https://lucide.dev/icons, falls back to a gamepad. */
export function getTabIcon(icon: string): LucideIcon {
  const name = toPascalCase(ALIASES[icon] ?? icon);
  return icons[name as keyof typeof icons] ?? Gamepad2;
}
