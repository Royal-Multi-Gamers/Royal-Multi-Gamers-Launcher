<#
  Construit le launcher avec Tauri puis empaquette le binaire en .msix
  pret a etre televerse dans le Espace partenaires (Microsoft Store).

  Usage:
    pnpm build:msix            -> build complet + packaging
    pnpm build:msix -SkipBuild -> reutilise le binaire deja compile
#>

[CmdletBinding()]
param(
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$tauriDir = Join-Path $root "src-tauri"
$iconsDir = Join-Path $tauriDir "icons"
$manifestTemplate = Join-Path $tauriDir "store\AppxManifest.xml"
$stagingDir = Join-Path $tauriDir "target\msix\package"
$outputDir = Join-Path $tauriDir "target\msix\output"
$exeName = "royal-multi-gamers-launcher.exe"

if (-not $SkipBuild) {
    $keyPath = Join-Path $tauriDir "updater.key"
    if (-not (Test-Path $keyPath)) {
        throw "Cle de signature introuvable: $keyPath. Necessaire meme pour le build MSIX (tauri build signe toujours quand une pubkey updater est configuree)."
    }

    Push-Location $root
    try {
        $env:VITE_STORE_BUILD = "1"
        $env:TAURI_SIGNING_PRIVATE_KEY = Get-Content -Raw $keyPath
        $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""
        pnpm tauri build
        if ($LASTEXITCODE -ne 0) { throw "pnpm tauri build a echoue (code $LASTEXITCODE)" }
    }
    finally {
        Remove-Item Env:\VITE_STORE_BUILD -ErrorAction SilentlyContinue
        Remove-Item Env:\TAURI_SIGNING_PRIVATE_KEY -ErrorAction SilentlyContinue
        Remove-Item Env:\TAURI_SIGNING_PRIVATE_KEY_PASSWORD -ErrorAction SilentlyContinue
        Pop-Location
    }
}

$exeSource = Join-Path $tauriDir "target\release\$exeName"
if (-not (Test-Path $exeSource)) {
    throw "Executable introuvable: $exeSource. Lance d'abord 'pnpm tauri build'."
}

$tauriConf = Get-Content (Join-Path $tauriDir "tauri.conf.json") -Raw | ConvertFrom-Json
$version = $tauriConf.version
$msixVersion = "$version.0"

if (Test-Path $stagingDir) { Remove-Item $stagingDir -Recurse -Force }
New-Item -ItemType Directory -Path $stagingDir -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stagingDir "Assets") -Force | Out-Null

Copy-Item $exeSource (Join-Path $stagingDir "Royal Multi Gamers Launcher.exe")

$assets = @("Square44x44Logo.png", "Square150x150Logo.png", "StoreLogo.png")
foreach ($asset in $assets) {
    Copy-Item (Join-Path $iconsDir $asset) (Join-Path $stagingDir "Assets\$asset")
}

# ------------------------------------------------------------
# Assets "unplated" pour la barre des taches / liste des taches
# Sans ces variantes, Windows dessine une plaque (BackgroundColor)
# derriere le logo dans la barre des taches, meme si le PNG est
# transparent et que le manifest declare BackgroundColor=transparent.
# ------------------------------------------------------------
Add-Type -AssemblyName System.Drawing

function New-ResizedPng {
    param([string]$SourcePath, [string]$DestPath, [int]$Size)
    $src = [System.Drawing.Image]::FromFile($SourcePath)
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($src, 0, 0, $Size, $Size)
    $graphics.Dispose()
    $bmp.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $src.Dispose()
}

$sourceIcon = Join-Path $iconsDir "icon.png"
$unplatedSizes = @(16, 24, 32, 40, 48, 64, 96, 256)
foreach ($size in $unplatedSizes) {
    $dest = Join-Path $stagingDir "Assets\Square44x44Logo.targetsize-${size}_altform-unplated.png"
    New-ResizedPng -SourcePath $sourceIcon -DestPath $dest -Size $size
}

$manifest = (Get-Content $manifestTemplate -Raw) -replace "__VERSION__", $msixVersion
Set-Content -Path (Join-Path $stagingDir "AppxManifest.xml") -Value $manifest -Encoding UTF8

$makeappx = Get-ChildItem "C:\Program Files (x86)\Windows Kits\10\bin\*\x64\makeappx.exe" -ErrorAction SilentlyContinue |
    Sort-Object FullName -Descending | Select-Object -First 1
if (-not $makeappx) {
    throw "makeappx.exe introuvable. Installe le composant 'Outils de signature et d'empaquetage MSIX' du Windows SDK."
}

if (-not (Test-Path $outputDir)) { New-Item -ItemType Directory -Path $outputDir -Force | Out-Null }
$msixPath = Join-Path $outputDir "RoyalMultiGamersLauncher-$version-x64.msix"
if (Test-Path $msixPath) { Remove-Item $msixPath -Force }

& $makeappx.FullName pack /d $stagingDir /p $msixPath /o
if ($LASTEXITCODE -ne 0) { throw "makeappx a echoue (code $LASTEXITCODE)" }

Write-Host ""
Write-Host "Package MSIX genere: $msixPath"
Write-Host "L'installeur NSIS est dans: $tauriDir\target\release\bundle\nsis"
Write-Host ""
Write-Host "Le .msix peut etre televerse tel quel dans Espace partenaires > Packages."
Write-Host "Microsoft signe automatiquement le package lors de la certification."
