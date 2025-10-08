# Justfile for Big3 Timer development

# Run the frontend dev server (Vite)
dev:
  @echo "Starting frontend dev server (Vite) on 0.0.0.0:5173"
  cd frontend && npm install && npm run dev -- --host 0.0.0.0

# Build frontend assets
build:
  @echo "Building frontend"
  cd frontend && npm install && npm run build

# Preview production build
preview: build
  @echo "Previewing production build"
  cd frontend && npm run preview -- --host 0.0.0.0
