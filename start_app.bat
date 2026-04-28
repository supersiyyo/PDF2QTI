@echo off
TITLE PDF2QTI Startup Manager

echo Starting PDF2QTI Services...

:: Get the directory where the script is located
set "PROJECT_DIR=%~dp0"

:: Launch Backend in a new window
echo Launching Backend...
start "PDF2QTI Backend" cmd /k "cd /d %PROJECT_DIR%backend && .venv\Scripts\activate && uvicorn main:app --reload"

:: Launch Frontend in a new window
echo Launching Frontend...
start "PDF2QTI Frontend" cmd /k "cd /d %PROJECT_DIR%frontend && npm run dev"

echo.
echo Both services have been fired! Check your taskbar for the new command prompt windows.
pause
