# Royal Multi Gamers Launcher

Launcher de jeux pour l'association Royal Multi Gamers, construit avec Tauri 2, React, TypeScript, Tailwind CSS et shadcn/ui.

## Développement

```bash
pnpm install
pnpm tauri dev
```

## Build

```bash
pnpm tauri build
```

Génère l'installeur NSIS dans `src-tauri/target/release/bundle/nsis`.

## Build Microsoft Store (MSIX)

```bash
pnpm run build:msix
```

Build le launcher avec Tauri puis empaquette le binaire en `.msix` (nécessite `makeappx.exe` du Windows SDK). Package généré dans `src-tauri/target/msix/output`.

Option `-SkipBuild` pour réutiliser le binaire déjà compilé :

```bash
pnpm run build:msix -SkipBuild
```

## Changer la version

```bash
pnpm run version:set 1.0.10
```

Synchronise la version dans `package.json`, `src-tauri/tauri.conf.json` et `src-tauri/Cargo.toml`.

L'ancienne version Electron du launcher est conservée dans le dossier [`OLD/`](OLD) à titre de référence.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
