#!/bin/bash

set -e

MODE="${1:-local}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [ "$MODE" = "local" ]; then
  echo "[FixFlow] Starting backend on http://localhost:4000 ..."
  cd "$ROOT/backend"
  npm run dev &
  BACKEND_PID=$!
  cd - > /dev/null

  sleep 2

  echo "[FixFlow] Starting frontend on http://localhost:3000 ..."
  cd "$ROOT/Frontend"
  npm run dev &
  FRONTEND_PID=$!
  cd - > /dev/null

  echo ""
  echo "[FixFlow] Running! Press Ctrl+C to stop both servers."
  echo "  Frontend: http://localhost:3000"
  echo "  Backend:  http://localhost:4000"
  echo ""

  trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '[FixFlow] Stopped.'; exit 0" SIGINT SIGTERM
  wait

elif [ "$MODE" = "vercel" ]; then
  echo "[FixFlow] Deploying frontend to Vercel..."
  cd "$ROOT/Frontend"
  vercel --prod
  cd - > /dev/null

elif [ "$MODE" = "seed" ]; then
  echo "[FixFlow] Seeding database..."
  cd "$ROOT/backend"
  npx tsx src/seed.ts
  cd - > /dev/null

else
  echo "Usage: $0 [local|vercel|seed]"
  echo ""
  echo "  local   - Run frontend + backend locally"
  echo "  vercel  - Deploy frontend to Vercel production"
  echo "  seed    - Seed the database with demo data"
  exit 1
fi
