# Graph Report - .  (2026-09-22)

## Corpus Check
- Corpus is ~24,840 words - fits in a single context window. You may not need a graph.

## Summary
- 323 nodes · 460 edges · 35 communities (19 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.72)
- Token cost: 771,617 input · 0 output

## Community Hubs (Navigation)
- Server Status UI
- Sidebar & News UI
- Frontend Dependencies
- Build Scripts & Dev Deps
- TypeScript Config
- Tauri Bundle Config
- shadcn Component Config
- Project Docs & Entry Point
- Rust Server Backend
- App Bootstrap & Theme
- Tauri Permissions
- App Shell Layout
- Vite Node Config
- Version Sync Script
- App Logo Asset
- App Icon Asset
- App Icon Asset
- App Icon Asset
- App Icon Asset
- App Icon Asset
- Store Tile Icon
- Store Tile Icon
- Store Tile Icon
- Store Tile Icon
- Store Tile Icon
- Store Tile Icon
- Store Tile Icon
- Store Tile Icon
- Store Tile Icon
- Store Logo Icon

## God Nodes (most connected - your core abstractions)
1. `cn()` - 27 edges
2. `compilerOptions` - 17 edges
3. `Royal Multi Gamers Launcher` - 11 edges
4. `ServerConfig` - 10 edges
5. `permissions` - 9 edges
6. `ServerStatus` - 8 edges
7. `TabConfig` - 8 edges
8. `scripts` - 7 edges
9. `offline_status()` - 7 edges
10. `check_status()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `index.html (Vite/Tauri entry page)` --conceptually_related_to--> `Tauri 2`  [INFERRED]
  index.html → README.md
- `src/main.tsx` --conceptually_related_to--> `React`  [INFERRED]
  index.html → README.md
- `esbuild allowBuilds setting` --conceptually_related_to--> `pnpm tauri dev (dev command)`  [INFERRED]
  pnpm-workspace.yaml → README.md
- `NewsCardProps` --references--> `NewsArticle`  [EXTRACTED]
  src/components/NewsCard.tsx → src/lib/types.ts
- `AppShellProps` --references--> `TabConfig`  [EXTRACTED]
  src/components/layout/AppShell.tsx → src/lib/types.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Frontend technology stack for the launcher UI** — readme_react, readme_typescript, readme_tailwind_css, readme_shadcn_ui, index_html [INFERRED 0.85]
- **Version synchronization across project manifest files** — readme_version_set_script, readme_package_json, readme_src_tauri_tauri_conf_json, readme_src_tauri_cargo_toml [EXTRACTED 1.00]
- **Build/packaging targets produced from the same Tauri app** — readme_pnpm_tauri_build, readme_build_msix, readme_tauri_2 [EXTRACTED 1.00]

## Communities (35 total, 16 thin omitted)

### Community 0 - "Server Status UI"
Cohesion: 0.12
Nodes (27): ConnectState, ServerCard(), ServerCardProps, TabPage(), TabPageProps, Badge(), badgeVariants, UseLauncherConfigResult (+19 more)

### Community 1 - "Sidebar & News UI"
Cohesion: 0.12
Nodes (23): DiscordIcon(), Sidebar(), SidebarProps, NewsCard(), NewsCardProps, Button(), buttonVariants, Card() (+15 more)

### Community 2 - "Frontend Dependencies"
Cohesion: 0.07
Nodes (29): @base-ui/react, class-variance-authority, clsx, @fontsource-variable/exo-2, lucide-react, dependencies, @base-ui/react, class-variance-authority (+21 more)

### Community 3 - "Build Scripts & Dev Deps"
Cohesion: 0.07
Nodes (26): devDependencies, @tauri-apps/cli, @types/node, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react (+18 more)

### Community 4 - "TypeScript Config"
Cohesion: 0.08
Nodes (23): DOM, DOM.Iterable, ES2020, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+15 more)

### Community 5 - "Tauri Bundle Config"
Cohesion: 0.08
Nodes (23): icons/128x128@2x.png, icons/128x128.png, icons/32x32.png, icons/icon.icns, icons/icon.ico, nsis, app, security (+15 more)

### Community 6 - "shadcn Component Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 7 - "Project Docs & Entry Point"
Cohesion: 0.11
Nodes (21): index.html (Vite/Tauri entry page), #root mount div, Inline theme init script (rmg-launcher-theme localStorage), logo.png (favicon), esbuild allowBuilds setting, pnpm run build:msix (MSIX packaging), OLD/ folder (legacy Electron launcher), package.json (+13 more)

### Community 8 - "Rust Server Backend"
Cohesion: 0.25
Nodes (18): AppHandle, HashMap, Option, Result, BattleBitServer, check_one(), check_servers(), check_status() (+10 more)

### Community 9 - "App Bootstrap & Theme"
Cohesion: 0.18
Nodes (12): App(), AppContent(), LoadingScreen(), TooltipProvider(), useLauncherConfig(), useNews(), useServerStatus(), getInitialTheme() (+4 more)

### Community 10 - "Tauri Permissions"
Cohesion: 0.13
Nodes (14): core:default, core:window:allow-close, core:window:allow-minimize, core:window:allow-set-focus, core:window:allow-show, core:window:allow-start-dragging, core:window:allow-toggle-maximize, main (+6 more)

### Community 11 - "App Shell Layout"
Cohesion: 0.24
Nodes (7): AppShell(), AppShellProps, Footer(), appWindow, TitleBar(), TitleBarButton(), TitleBarProps

### Community 12 - "Vite Node Config"
Cohesion: 0.22
Nodes (8): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 13 - "Version Sync Script"
Cohesion: 0.22
Nodes (8): cargo, cargoPath, conf, confPath, pkg, pkgPath, root, updatedCargo

## Knowledge Gaps
- **147 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+142 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Frontend Dependencies` to `Build Scripts & Dev Deps`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `cn()` connect `Sidebar & News UI` to `Server Status UI`, `App Shell Layout`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _147 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Server Status UI` be split into smaller, more focused modules?**
  _Cohesion score 0.11522048364153627 - nodes in this community are weakly interconnected._
- **Should `Sidebar & News UI` be split into smaller, more focused modules?**
  _Cohesion score 0.12299465240641712 - nodes in this community are weakly interconnected._
- **Should `Frontend Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `Build Scripts & Dev Deps` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._