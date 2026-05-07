#!/bin/bash

# Determine absolute path to the project root
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================"
echo "  PDF2QTI - Installing Dependencies"
echo "============================================"
echo ""

# ---- BACKEND ----
echo "[1/4] Setting up Python virtual environment..."
cd "$PROJECT_DIR/backend"

if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment. Is Python 3 installed?"
        exit 1
    fi
    echo "      Virtual environment created."
else
    echo "      Virtual environment already exists, skipping creation."
fi

echo ""
echo "[2/4] Installing backend Python dependencies..."
source .venv/bin/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: pip install failed. Check requirements.txt and your internet connection."
    exit 1
fi
echo "      Backend dependencies installed successfully."

# ---- FRONTEND ----
echo ""
echo "[3/4] Installing frontend Node.js dependencies..."
cd "$PROJECT_DIR/frontend"
if [ ! -f "package.json" ]; then
    echo "ERROR: No package.json found in frontend/. Is this the right directory?"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed. Is Node.js installed?"
    exit 1
fi
echo "      Frontend dependencies installed successfully."

# ---- ENV FILE ----
echo ""
echo "[4/4] Checking for .env file..."
cd "$PROJECT_DIR/backend"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "      .env created from .env.example — remember to add your GEMINI_API_KEY!"
    else
        echo "      WARNING: No .env or .env.example found. Create backend/.env with your GEMINI_API_KEY."
    fi
else
    echo "      .env already exists."
fi

echo ""
echo "============================================"
echo "  All done! Run ./start_app.sh to launch."
echo "============================================"
echo ""
