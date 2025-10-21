@echo off
echo D&D Custom - AI Services Setup Guide
echo =====================================
echo.
echo This script will guide you through setting up FREE local AI services.
echo.
echo STEP 1: Install Ollama (for text generation)
echo --------------------------------------------
echo 1. Download Ollama from: https://ollama.ai/download
echo 2. Install and run Ollama
echo 3. Open Command Prompt and run: ollama pull mistral
echo 4. Open Command Prompt and run: ollama serve
echo 5. Ollama will run on http://localhost:11434
echo.
echo STEP 2: Install Stable Diffusion (for image generation) - OPTIONAL
echo ------------------------------------------------------------------
echo Option A - Easy Setup (Recommended):
echo 1. Download AUTOMATIC1111 from: https://github.com/AUTOMATIC1111/stable-diffusion-webui
echo 2. Follow their installation guide
echo 3. Go to directory of stable-diffusion-webui
echo 3. Run the command: run.bat
echo 4. It will run on http://localhost:7860
echo.
echo Option B - Skip Image Generation:
echo Your app will work fine without images, using text descriptions only.
echo.
echo STEP 3: Verify Setup
echo -------------------
echo Run check-ai-services.bat to test if everything is working.
echo.
pause
