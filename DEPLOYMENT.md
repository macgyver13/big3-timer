# Deployment Guide

This guide covers various deployment options for the Big3 Timer application.

## Pre-Deployment Checklist

- [ ] Test the production build locally: `just serve`
- [ ] Verify all features work in production mode
- [ ] Update exercise videos in `backend/config/exercises.json`
- [ ] Create proper app icons (192x192 and 512x512 PNG)
- [ ] Test PWA installation on target devices

## Deployment Options

### Option 1: Simple VPS Deployment (DigitalOcean, Linode, etc.)

#### Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ installed
- Nginx (optional, for reverse proxy)

#### Steps

1. **Clone and build the application**
   ```bash
   git clone <your-repo-url> big3-timer
   cd big3-timer
   cd frontend && npm install && npm run build
   cd ../backend && npm install
   ```

2. **Set up environment variables**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

3. **Run with PM2 (recommended)**
   ```bash
   npm install -g pm2
   cd backend
   pm2 start server.js --name big3-timer
   pm2 save
   pm2 startup  # Follow instructions to enable startup on boot
   ```

4. **Set up Nginx reverse proxy (optional)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./dist
COPY backend/config ./config

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
```

#### Build and run
```bash
docker build -t big3-timer .
docker run -d -p 3000:3000 --name big3-timer --restart unless-stopped big3-timer
```

#### Using Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  big3-timer:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
```

```bash
docker-compose up -d
```

### Option 3: Fly.io Deployment

#### Requirements
- Install flyctl: https://fly.io/docs/hands-on/install-flyctl/

#### Steps

1. **Login to Fly.io**
   ```bash
   flyctl auth login
   ```

2. **Create fly.toml**
   ```toml
   app = "big3-timer"

   [build]
     dockerfile = "Dockerfile"

   [[services]]
     internal_port = 3000
     protocol = "tcp"

     [[services.ports]]
       handlers = ["http"]
       port = 80

     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443
   ```

3. **Deploy**
   ```bash
   flyctl launch
   flyctl deploy
   ```

### Option 4: Render.com Deployment

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Environment**: `NODE_ENV=production`

### Option 5: Railway.app Deployment

1. Connect your GitHub repository to Railway
2. Add environment variable: `NODE_ENV=production`
3. Railway will auto-detect and deploy

### Option 6: Cloudflare Pages + Worker

For a serverless edge deployment:

1. Deploy frontend to Cloudflare Pages
2. Create a Cloudflare Worker to serve the API
3. Update CORS configuration for cross-origin requests

## Post-Deployment

### Verify Installation

1. Access your deployed URL
2. Test workout flow end-to-end
3. Verify PWA installation on mobile device
4. Test offline functionality
5. Check audio alerts work properly

### Monitoring

**Using PM2:**
```bash
pm2 monit           # Real-time monitoring
pm2 logs big3-timer # View logs
pm2 restart big3-timer  # Restart app
```

**Using Docker:**
```bash
docker logs big3-timer      # View logs
docker stats big3-timer     # Resource usage
docker restart big3-timer   # Restart container
```

### Updating the Application

**With PM2:**
```bash
cd big3-timer
git pull
cd frontend && npm install && npm run build
cd ../backend && npm install
pm2 restart big3-timer
```

**With Docker:**
```bash
cd big3-timer
git pull
docker build -t big3-timer .
docker stop big3-timer
docker rm big3-timer
docker run -d -p 3000:3000 --name big3-timer --restart unless-stopped big3-timer
```

## Troubleshooting

### Issue: PWA not installing on iOS

- Ensure app is served over HTTPS
- Verify `manifest.webmanifest` is accessible
- Check `display: "fullscreen"` in manifest
- Test in Safari (iOS Safari required for PWA)

### Issue: Audio not playing

- Audio requires user interaction on first visit
- Check browser console for Web Audio API errors
- Verify audio permissions in browser settings

### Issue: Screen not staying awake

- Wake Lock API requires HTTPS
- Check browser compatibility
- Verify permissions are granted

### Issue: Videos not loading

- Check `backend/config/exercises.json` syntax
- Verify external video URLs are accessible
- Check CORS settings if videos are from different domain

## Performance Optimization

1. **Enable gzip compression** (Nginx example):
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Add caching headers** for static assets:
   ```nginx
   location /assets/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Monitor bundle size**:
   ```bash
   cd frontend && npm run build -- --report
   ```

## Security Considerations

- Always use HTTPS in production
- Keep dependencies updated: `npm audit fix`
- Set appropriate CORS policies
- Use environment variables for sensitive config
- Implement rate limiting if needed (e.g., with `@fastify/rate-limit`)

## Backup and Recovery

Since the app uses localStorage for settings, no backend database backup is needed. However:

1. Keep `backend/config/exercises.json` in version control
2. Backup any customizations or additional configuration
3. Document any environment-specific settings

## Scaling

For high-traffic scenarios:

1. Use a CDN for static assets
2. Deploy multiple instances behind a load balancer
3. Consider caching API responses
4. Monitor performance with tools like New Relic or DataDog
