# Environment Variables Configuration

## Overview

This frontend app uses environment variables to configure the backend API base URL. This allows the same built artifacts to work across different deployment environments (development, staging, production).

## Environment Files

- `.env` – Local development (included in `.gitignore`, should not be committed)
- `.env.example` – Template showing available variables
- `.env.production` – Production defaults (can be overridden at build time)

## Setting the Backend URL

### Local Development

Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:8080
```

Then run:
```bash
npm run dev
```

### Build Time (Docker, CI/CD)

Pass environment variables at build time:

**Docker:**
```dockerfile
ARG VITE_API_BASE_URL=https://api.production.example.com
RUN VITE_API_BASE_URL=$VITE_API_BASE_URL npm run build
```

**GitHub Actions or CI:**
```yaml
- name: Build
  env:
    VITE_API_BASE_URL: https://api.production.example.com
  run: npm run build
```

**Manual CLI:**
```bash
VITE_API_BASE_URL=https://api.production.example.com npm run build
```

### Runtime (Advanced)

For truly dynamic runtime configuration (without rebuilding), you can inject the URL into the HTML or use a config endpoint. Currently, the app loads it from `.env` at build time.

## Example Deployments

### Vercel

Add environment variable in project settings:
- `VITE_API_BASE_URL`: `https://api.production.example.com`

### Netlify

Add environment variable in `Build & Deploy` settings:
- `VITE_API_BASE_URL`: `https://api.production.example.com`

### AWS Amplify

Configure in `amplify.yml` or via the console:
```yaml
env:
  variables:
    VITE_API_BASE_URL: https://api.production.example.com
```

## Security Notes

- Never commit `.env` to version control (already in `.gitignore`)
- The backend URL is public-facing and visible in the built app; do not embed secrets there
- Use secure, HTTPS URLs in production
- Ensure CORS is properly configured on the backend to allow requests from your frontend domain
