@echo off
echo D&D Custom - Application Status Check
echo =====================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js is installed
    node --version
) else (
    echo ❌ Node.js is not installed or not in PATH
)

echo.
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm is installed
    npm --version
) else (
    echo ❌ npm is not installed or not in PATH
)

echo.
echo Checking project dependencies...
if exist "node_modules" (
    echo ✅ Dependencies are installed
) else (
    echo ❌ Dependencies not installed. Run: npm install
)

echo.
echo Checking database setup...
if exist "data\campaign_data.db" (
    echo ✅ Database exists
) else (
    echo ⚠️  Database not initialized. Run: setup-database.bat
)

echo.
echo Checking AI services...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ollama is running (text generation)
) else (
    echo ⚠️  Ollama is not running (optional AI features)
)

curl -s http://localhost:7860/sdapi/v1/options >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Stable Diffusion is running (image generation)
) else (
    echo ⚠️  Stable Diffusion is not running (optional images)
)

echo.
echo Checking critical files...
if exist "src\components\DMControls\EnvironmentalControls.js" (
    echo ✅ EnvironmentalControls component exists
) else (
    echo ❌ EnvironmentalControls component missing
)

if exist "src\pages\index.js" (
    echo ✅ Main page exists
) else (
    echo ❌ Main page missing
)

if exist "src\services\db.js" (
    echo ✅ Database service exists
) else (
    echo ❌ Database service missing
)

echo.
echo Status check complete!
echo.
echo To start the app: start-dnd-game.bat
pause
