# Big3 Timer

A Progressive Web App (PWA) for Stuart McGill's Big 3 exercises: Curl Up, Side Plank, and Bird Dog.

## Features

- **Guided Workout Timer**: Automated timing for holds, pauses, and sets
- **Pyramid Training**: Descending pyramid sets (default: 12, 8, 4 reps)
- **Workout Presets**: Beginner (8, 4, 2 reps, 7s holds) and Advanced (12, 8, 4 reps, 10s holds)
- **Audio Feedback**: Distinct sounds for hold completion and set completion
- **Video Integration**: Access exercise demonstration videos before starting
- **Exercise Selection**: Start from any exercise or do exercises à la carte
- **Visual Progress**: Circular timer and workout checklist showing completed/current/upcoming exercises
- **PWA Support**: Install on mobile/tablet, works offline, prevents screen sleep during workouts
- **Customizable**: Adjust timing, rep counts, exercise order, audio preferences, and theme
- **Keyboard Shortcuts**: Space/P (pause), Enter (start/continue), S (skip), Esc (stop)

## Quick Start

### Development

Requirements:
- Node.js 18+ (or use Nix flake)
- npm

```bash
# Using Just
just dev

# Or manually
cd frontend && npm install && npm run dev &
cd backend && npm install && npm start
```

Frontend will run on http://localhost:5173
Backend will run on http://localhost:3000

### Production Build

```bash
# Build and serve
just serve

# Or manually
cd frontend && npm run build
cd backend && npm start
```

The backend serves the built frontend from `frontend/dist/` on http://localhost:3000

## Development with Nix

This project includes a Nix flake for reproducible development environments:

```bash
# Enter development shell
nix develop

# Or use direnv
echo "use flake" > .envrc
direnv allow
```

## Project Structure

```
big3-timer/
├── frontend/           # React + Vite PWA
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── context/    # React context for state
│   │   ├── hooks/      # Custom React hooks
│   │   └── main.jsx
│   ├── public/
│   └── vite.config.js
├── backend/            # Fastify server
│   ├── config/         # Exercise configuration
│   │   └── exercises.json
│   └── server.js
├── planning/           # Development todos
├── Justfile            # Task runner commands
└── flake.nix          # Nix development environment
```

## Configuration

### Exercise Videos

Edit `backend/config/exercises.json` to customize exercise videos:

```json
{
  "exercises": [
    {
      "id": "curl-up",
      "name": "Curl Up",
      "description": "...",
      "videos": [
        {
          "title": "Video Title",
          "url": "https://...",
          "duration": "2:15"
        }
      ]
    }
  ]
}
```

### User Settings

All user preferences are stored in browser localStorage:
- Workout presets (beginner/advanced)
- Rep counts (pyramid sets)
- Hold and pause durations
- Exercise order
- Audio preferences and volume
- Theme (light/dark)

## Deployment

### Using Docker (Recommended)

```bash
# Build image
docker build -t big3-timer .

# Run container
docker run -p 3000:3000 big3-timer
```

### Manual Deployment

1. Build the frontend: `cd frontend && npm run build`
2. Deploy `backend/` directory with `frontend/dist/` to your server
3. Set `NODE_ENV=production`
4. Run `node server.js` or use a process manager like PM2

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Set to `production` for production deployment

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+ (iOS Safari 14+)

PWA features (offline, install, wake lock) require modern browser support.

## License

MIT

## Credits

Based on Stuart McGill's Big 3 exercises for core stability and back health.
