@echo off
echo Setting up D&D Custom Database...

REM Create data directory if it doesn't exist
if not exist "data" mkdir data

REM Initialize database
echo Initializing database...
npm run init-db

if %errorlevel% equ 0 (
    echo Database setup completed successfully!
) else (
    echo Database setup failed. Please check the error messages above.
)

pause
