# Justfile for Big3 Timer development

# Run the frontend dev server (Vite)
frontend:
  @echo "Starting frontend dev server (Vite) on 0.0.0.0:5173"
  cd frontend && npm install && npm run dev -- --host 0.0.0.0

# Run the backend server
backend:
  @echo "Starting backend server (Fastify) on 0.0.0.0:3000"
  cd backend && npm install && npm start

# Start both frontend and backend. Frontend is run in background; backend runs in foreground.
# When backend exits, frontend will be killed.
dev:
  #!/usr/bin/env bash
  set -euo pipefail
  echo "Starting frontend (background) and backend (foreground). Ctrl-C to stop."
  (cd frontend && npm install && npm run dev -- --host 0.0.0.0) &
  FRONTEND_PID=$!
  echo "Frontend started with PID=$FRONTEND_PID"
  (cd backend && npm install)
  trap "echo 'Killing frontend...'; kill $FRONTEND_PID 2>/dev/null || true" EXIT
  (cd backend && node server.js)

# Build frontend assets
build:
  @echo "Building frontend"
  cd frontend && npm install && npm run build

# Build frontend then serve via backend (backend serves static files)
serve: build
  @echo "Serving built frontend from backend"
  cd backend && npm install && node server.js
