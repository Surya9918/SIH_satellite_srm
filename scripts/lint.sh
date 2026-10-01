#!/bin/bash
set -e

echo "🔍 Linting Satellite-SRM Project..."

echo "==> Linting Python (Backend)..."
cd Satellite_SRM_DL
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi
# Assuming flake8 is in requirements-dev.txt
flake8 server.py || echo "Flake8 found issues in backend."
cd ../..

echo "==> Linting TypeScript (Frontend)..."
cd satellite-srm-frontend
npm run lint || echo "ESLint found issues in frontend."
cd ..

echo "✅ Linting complete."
