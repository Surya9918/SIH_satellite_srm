#!/bin/bash
set -e

echo "🛰️ Setting up Satellite-SRM for macOS/Linux..."

echo "==> Setting up Backend..."
cd backend-main/Satellite_SRM_DL
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
cd ../..

echo "==> Setting up Frontend..."
cd satellite-srm-frontend
npm install
cd ..

echo "✅ Setup complete! You can now run the app via docker-compose up or using the native start scripts."
