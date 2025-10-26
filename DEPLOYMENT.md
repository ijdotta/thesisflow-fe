# Frontend Deployment Guide

## SPA Routing Configuration

This is a React Single Page Application (SPA) that uses client-side routing. When deploying to production, the server must be configured to serve `index.html` for all routes that are not actual assets.

### Why This Matters

When you navigate directly to a URL like `/projects` or refresh the page, the server receives a request for that path. Without proper configuration, it tries to find a file at that path and returns a 404. The correct behavior is to serve `index.html`, which then loads the JavaScript that renders the appropriate component based on the URL.

### Deployment Instructions by Platform

#### Netlify
- No special configuration needed - Netlify automatically handles SPA routing
- Just run `npm run build` and deploy the `dist` folder

#### Vercel
- No special configuration needed - Vercel automatically handles SPA routing
- Just run `npm run build` and deploy

#### Static Server (nginx, Apache, etc.)

**nginx:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Apache:**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Node.js Server

If serving from a Node.js server (Express, etc.):
```javascript
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.static(path.join(__dirname, 'dist')))

// Serve index.html for all routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(3000)
```

### Environment Variables

For production deployment, make sure to set the `VITE_API_URL` environment variable to point to your backend:

```bash
VITE_API_URL=https://api.your-domain.com npm run build
```

Or set it in your `.env.production` file:
```
VITE_API_URL=https://api.your-domain.com
```

The frontend will then use this URL for all API calls.

### Build and Deploy

1. Build the frontend:
   ```bash
   npm run build
   ```

2. The `dist` folder contains all production assets - deploy these to your server

3. Configure your server to handle SPA routing as described above

4. Ensure `VITE_API_URL` environment variable is set correctly for your production backend

### Troubleshooting

If you're getting 404 errors on direct navigation or page refresh:
- Check that your server is properly configured to serve `index.html` for unknown routes
- Verify that assets (CSS, JS) are loading correctly (check browser DevTools Network tab)
- Check that `VITE_API_URL` is pointing to the correct backend

If you're getting CORS errors:
- Ensure your backend has CORS configured to accept requests from your frontend domain
- Check that the `Authorization` header is being sent with requests
