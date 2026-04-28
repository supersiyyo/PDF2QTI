#!/bin/bash

# Determine absolute path to the project root
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting PDF2QTI Services..."

# Try to use gnome-terminal (default on Ubuntu/GNOME)
if command -v gnome-terminal &> /dev/null; then
    echo "Launching Backend..."
    gnome-terminal --title="PDF2QTI Backend" -- bash -c "cd \"$PROJECT_DIR/backend\" && source .venv/bin/activate && uvicorn main:app --reload; exec bash"
    
    echo "Launching Frontend..."
    gnome-terminal --title="PDF2QTI Frontend" -- bash -c "cd \"$PROJECT_DIR/frontend\" && npm run dev; exec bash"

# Fallback to xterm if gnome-terminal isn't available
elif command -v xterm &> /dev/null; then
    echo "Launching Backend..."
    xterm -T "PDF2QTI Backend" -e bash -c "cd \"$PROJECT_DIR/backend\" && source .venv/bin/activate && uvicorn main:app --reload; exec bash" &
    
    echo "Launching Frontend..."
    xterm -T "PDF2QTI Frontend" -e bash -c "cd \"$PROJECT_DIR/frontend\" && npm run dev; exec bash" &

else
    echo "Error: Could not find gnome-terminal or xterm to launch separate windows."
    echo "Please launch them manually or run this script in a specialized terminal environment."
fi

echo "Both standard services have been fired! Check your taskbar for the new terminal windows."
