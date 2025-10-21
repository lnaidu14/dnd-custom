@echo off
title D&D Custom - Virtual Tabletop
echo Starting D&D Custom Virtual Tabletop...
echo =====================================

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Clean .next folder if it exists (fixes permission issues)
if exist ".next" (
    echo Cleaning build cache...
    powershell -Command "try { Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue } catch { }"
)

REM Check if database exists, create if not
if not exist "data\campaign_data.db" (
    echo Setting up database...
    call setup-database.bat
)

REM Start the development server
echo.
echo Starting the game server...
echo Your friends can join at: http://70.50.136.103:3000
echo Local access: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
