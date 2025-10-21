@echo off
echo Checking AI Services Status...
echo =============================

echo.
echo Checking Ollama (Text Generation)...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Ollama is running on port 11434
) else (
    echo ❌ Ollama is not running. Please start Ollama first.
    echo    Run: ollama serve
)

echo.
echo Checking Stable Diffusion (Image Generation)...
curl -s http://localhost:7860/sdapi/v1/options >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Stable Diffusion is running on port 7860
) else (
    echo ⚠️  Stable Diffusion is not running (optional)
    echo    Your app will work without image generation
)

echo.
echo Status check complete!
pause
