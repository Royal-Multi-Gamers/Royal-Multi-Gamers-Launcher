@echo off
echo ========================================
echo  Royal Multi Gamers Launcher - Build MSIX
echo ========================================
echo.

echo Nettoyage des anciens builds...
if exist dist rmdir /s /q dist
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo Installation des dependances...
call npm install

echo.
echo Construction du package MSIX pour Microsoft Store...
call npm run build-store

echo.
echo ========================================
echo Build termine!
echo.
echo Fichiers generes dans le dossier 'dist':
if exist "dist\*.appx" (
    echo - Package MSIX: dist\*.appx
) else (
    echo ERREUR: Aucun package MSIX genere
)

echo.
echo Pour publier sur Microsoft Store:
echo 1. Ouvrez Partner Center (https://partner.microsoft.com)
echo 2. Creez une nouvelle soumission d'application
echo 3. Telechargez le fichier .appx genere
echo 4. Completez les informations requises
echo 5. Soumettez pour certification
echo.

pause
