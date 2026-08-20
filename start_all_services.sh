#!/bin/bash
# =================================================================
# DAK GHAR NIRYAT KENDRA (DNK) - MASTER STARTUP SCRIPT (Linux/macOS)
# =================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/dak-ghar-backend"
AI_DIR="$PROJECT_ROOT/dnk-ai-engine"
BUYER_DIR="$PROJECT_ROOT/DNK/dnk-buyer-storefront"
ARTISAN_DIR="$PROJECT_ROOT/DNK/dnk-artisan-app"

echo "================================================================="
echo "         DAK GHAR NIRYAT KENDRA (DNK) - MASTER STARTUP           "
echo "================================================================="

# Helper to find uvicorn executable
get_uvicorn() {
    local dir="$1"
    if [ -f "$dir/.venv/bin/uvicorn" ]; then
        echo "$dir/.venv/bin/uvicorn"
    elif [ -f "$dir/venv/bin/uvicorn" ]; then
        echo "$dir/venv/bin/uvicorn"
    else
        echo "uvicorn"
    fi
}

echo ""
echo "[1/4] Starting dak-ghar-backend on 127.0.0.1:8000..."
BACKEND_EXE=$(get_uvicorn "$BACKEND_DIR")
(cd "$BACKEND_DIR" && "$BACKEND_EXE" main:app --host 127.0.0.1 --port 8000) &

echo "[2/4] Starting dnk-ai-engine on 127.0.0.1:8001..."
AI_EXE=$(get_uvicorn "$AI_DIR")
(cd "$AI_DIR" && "$AI_EXE" app.main:app --host 127.0.0.1 --port 8001) &

echo "[3/4] Starting dnk-buyer-storefront on http://localhost:3000..."
(cd "$BUYER_DIR" && npm run dev) &

echo "[4/4] Starting dnk-artisan-app on http://localhost:8081..."
(cd "$ARTISAN_DIR" && npx expo start) &

echo ""
echo "All 4 microservices launched in background."
echo "Press Ctrl+C to stop this script (background jobs may need manual kill)."
wait