@echo off
echo Building Royal Multi Gamers Launcher...
echo.

REM Install electron-builder if not already installed
npm install --save-dev electron-builder

REM Build the application
echo Building Windows executable...
npm run build-win

echo.
echo Build complete! Check the 'dist' folder for the executable.
pause
