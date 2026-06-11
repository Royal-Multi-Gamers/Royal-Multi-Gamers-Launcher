import {
  Crosshair,
  Gamepad2,
  Globe,
  Home,
  Leaf,
  Plane,
  Swords,
  Target,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/** Maps the Font Awesome icon names used in the remote config to lucide icons. */
const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  crosshairs: Crosshair,
  bullseye: Target,
  leaf: Leaf,
  plane: Plane,
  gun: Swords,
  wifi: Wifi,
  globe: Globe,
  gamepad: Gamepad2,
};

export function getTabIcon(icon: string): LucideIcon {
  return ICON_MAP[icon] ?? Gamepad2;
}
