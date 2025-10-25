# Authentication Implementation

## Overview
This frontend has been configured with JWT-based authentication that integrates with the backend API specification.

## Architecture

### Key Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Manages authentication state globally
   - Stores user info (userId, role, professorId, token, expiresAt) in localStorage
   - Handles token expiry detection
   - Provides `useAuth()` hook for accessing auth state and methods

2. **Auth API** (`src/api/auth.ts`)
   - `authApi.login()` - authenticates with username/password

3. **LoginPage** (`src/pages/LoginPage.tsx`)
   - Simple, clean login form
   - Shows loading state while logging in
   - Redirects to /projects on successful login
   - Shows error toast on failure

4. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
   - Wrapper component that redirects unauthenticated users to login

5. **Axios Interceptors** (`src/api/axios.ts`)
   - Request interceptor: automatically adds `Authorization: Bearer {token}` header
   - Response interceptor: 
     - On 401: clears localStorage and redirects to login
     - On 403: shows error toast (permission denied)
     - Deduplicates error toasts to avoid toast flooding

### Router Setup (`src/main.tsx`)
- All routes except `/login` are wrapped with `ProtectedRoute`
- Unauthenticated users trying to access protected routes are redirected to login
- Uses react-router-dom's declarative routing

## How It Works

### Login Flow
1. User navigates to `/login` or is redirected there if unauthenticated
2. User enters credentials (default: admin/admin123)
3. Frontend calls `POST /auth/login` with credentials
4. Backend returns: `{ token, expiresAt, role, userId, professorId? }`
5. Frontend stores auth user in localStorage and updates AuthContext
6. User is redirected to `/projects` (or previous page)

### Subsequent Requests
1. Every request includes `Authorization: Bearer <token>` header via axios interceptor
2. If token is expired (401 response):
   - localStorage is cleared
   - User is redirected to login
3. If user lacks permissions (403 response):
   - Error message is displayed
   - User remains logged in (can try different action)

### Token Expiry
- Tokens expire after 1 hour by default (backend configurable)
- Frontend checks expiry on component mount via `useEffect` in AuthContext
- If expired, automatically logs out
- On 401 response, user is also immediately logged out and redirected

## Usage in Components

### Access Auth State
```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginPage />
  }
  
  return <div>Welcome {user?.role}</div>
}
```

### Role-Based UI (Future)
```tsx
const { user } = useAuth()

if (user?.role === 'ADMIN') {
  // Show admin controls
}

if (user?.role === 'PROFESSOR' && user?.professorId) {
  // Show professor-specific controls
}
```

## Testing

### Test with Admin Credentials
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-25T22:28:31.123Z",
  "role": "ADMIN",
  "userId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "professorId": null
}
```

### Test Frontend Login
1. Start the frontend dev server: `npm run dev`
2. Navigate to http://localhost:5173 (you'll be redirected to `/login`)
3. Enter `admin` / `admin123`
4. You should be redirected to `/projects`
5. Token is stored in localStorage under `accessToken`
6. User info is stored in localStorage under `authUser`

### Test Token Expiry
1. Log in and check localStorage
2. Modify the `expiresAt` to a past date
3. Refresh the page or navigate to a protected route
4. You should be logged out and redirected to login

### Test with Professor Account
Once professor accounts exist in the backend:
1. Create a professor user in the database
2. Log in with professor credentials
3. Frontend should have `user.role === 'PROFESSOR'` and `user.professorId` set
4. Backend should return 403 when professor tries unauthorized actions

## Security Notes

### Current Implementation
- Token stored in localStorage (XSS vulnerable if not careful with 3rd-party scripts)
- No refresh token yet (plan for future addition per backend spec)
- HTTP-only cookies not used (would require backend support)
- Token re-sent on every request (no caching at API level)

### Recommendations
- Keep application clean of 3rd-party scripts
- Consider implementing:
  - HTTP-only cookies for token storage
  - CSRF protection
  - Content Security Policy headers
  - Regular token rotation (via refresh endpoint when available)

## File Structure
```
src/
  api/
    auth.ts                    # Auth API calls
    axios.ts                   # Axios with interceptors
  contexts/
    AuthContext.tsx            # Auth state management
  pages/
    LoginPage.tsx             # Login UI
  components/
    ProtectedRoute.tsx        # Route protection wrapper
    AppSidebar.tsx            # Updated with logout button
  constants/
    routes.ts                 # Updated with login route
  types/
    Auth.ts                   # Auth TypeScript types
  main.tsx                    # Updated with BrowserRouter and auth setup
```

## Future Enhancements
- [ ] Implement refresh token endpoint
- [ ] Add password reset flow
- [ ] Add remember-me functionality
- [ ] Add 2FA support
- [ ] Switch to HTTP-only cookies
- [ ] Add role-based UI feature flags
- [ ] Add permission checking before API calls
