@echo off
echo Lancement du Game Association Launcher...
echo.

REM Vérifier si Node.js est installé
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js n'est pas installé ! Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo Installation des dépendances...
    npm install
)

REM Lancer le launcher
npm start

pause
