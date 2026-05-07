@echo off
TITLE PDF2QTI Dependency Installer

:: Get the directory where the script is located
set "PROJECT_DIR=%~dp0"

echo ============================================
echo   PDF2QTI - Installing Dependencies
echo ============================================
echo.

:: ---- BACKEND ----
echo [1/4] Setting up Python virtual environment...
cd /d "%PROJECT_DIR%backend"

if not exist ".venv" (
    python -m venv .venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment. Is Python installed?
        pause
        exit /b 1
    )
    echo       Virtual environment created.
) else (
    echo       Virtual environment already exists, skipping creation.
)

echo.
echo [2/4] Installing backend Python dependencies...
call .venv\Scripts\activate
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: pip install failed. Check requirements.txt and your internet connection.
    pause
    exit /b 1
)
echo       Backend dependencies installed successfully.

:: ---- FRONTEND ----
echo.
echo [3/4] Installing frontend Node.js dependencies...
cd /d "%PROJECT_DIR%frontend"
if not exist "package.json" (
    echo ERROR: No package.json found in frontend\. Is this the right directory?
    pause
    exit /b 1
)
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed. Is Node.js installed?
    pause
    exit /b 1
)
echo       Frontend dependencies installed successfully.

:: ---- DONE ----
echo.
echo [4/4] Checking for .env file...
cd /d "%PROJECT_DIR%backend"
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo       .env created from .env.example — remember to add your GEMINI_API_KEY!
    ) else (
        echo       WARNING: No .env or .env.example found. Create backend\.env with your GEMINI_API_KEY.
    )
) else (
    echo       .env already exists.
)

echo.
echo ============================================
echo   All done! Run start_app.bat to launch.
echo ============================================
echo.
pause
