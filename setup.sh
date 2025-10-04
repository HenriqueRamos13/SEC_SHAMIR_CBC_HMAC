#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Working directory: $(pwd)"

echo "Installing backend dependencies..."
cd backend
if [ -f "package.json" ]; then
    npm install
    echo "Backend dependencies installed successfully"
else
    echo "package.json not found in backend directory"
    exit 1
fi

echo "Installing frontend dependencies..."
cd ../frontend
if [ -f "package.json" ]; then
    npm install
    echo "Frontend dependencies installed successfully"
else
    echo "package.json not found in frontend directory"
    exit 1
fi

cd ..

echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm run dev"
