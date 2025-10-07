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
- Vercel CLI (optional, for local serverless testing)

```bash
# Using Just
just dev

# Or manually
cd frontend && npm install && npm run dev
```

Frontend will run on http://localhost:5173

### Local Testing with Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Run serverless functions locally
vercel dev
```

This simulates the production serverless environment locally.

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
│   │   └── exercises.json  # Exercise configuration
│   └── vite.config.js
├── api/                # Vercel serverless functions
│   ├── health.js       # Health check endpoint
│   └── exercises.js    # Exercise data endpoint
├── planning/           # Development todos
├── Justfile            # Task runner commands
├── vercel.json         # Vercel deployment config
└── flake.nix          # Nix development environment
```

## Configuration

### Exercise Videos

Edit `frontend/public/exercises.json` to customize exercise videos:

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

### Vercel (Recommended)

This app is designed for Vercel's serverless platform:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

The app automatically deploys:
- Frontend from `frontend/dist`
- Serverless API functions from `/api`

### Configuration

Vercel configuration is in [vercel.json](vercel.json):
- Builds frontend with Vite
- Serves static files from `frontend/dist`
- Routes `/api/*` requests to serverless functions

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+ (iOS Safari 14+)

PWA features (offline, install, wake lock) require modern browser support.

## License

MIT

## Credits

Based on Stuart McGill's Big 3 exercises for core stability and back health.
