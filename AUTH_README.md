# ThesisFlow Frontend - Authentication Implementation

## Overview

This document provides comprehensive information about the authentication system implemented in the ThesisFlow frontend.

## Quick Start

### Prerequisites
- Backend API running at `http://localhost:8080` (configurable in `.env`)
- Backend has implemented `POST /auth/login` endpoint
- User credentials available (default: `admin` / `admin123`)

### Running the App
```bash
npm install
npm run dev
```

The app will open at `http://localhost:5173` and redirect to the login page.

### First Login
1. Username: `admin`
2. Password: `admin123`
3. You'll be redirected to the projects page

## Architecture

### Components

#### 1. AuthContext (`src/contexts/`)
- **AuthContextDefinition.ts**: Defines the context type
- **AuthContext.tsx**: Provides the `AuthProvider` component that manages auth state
- **useAuth.ts**: Custom hook to access auth state

```tsx
const { user, isAuthenticated, login, logout, isLoading } = useAuth()
```

#### 2. LoginPage (`src/pages/LoginPage.tsx`)
- Clean login form
- Username and password inputs
- Loading state while authenticating
- Error handling with toast notifications
- Auto-redirect to projects on success

#### 3. ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- Wrapper component for route protection
- Redirects unauthenticated users to login
- Used for all app routes except login

#### 4. API Integration (`src/api/`)
- **auth.ts**: Login API call
- **axios.ts**: Request/response interceptors

#### 5. Sidebar (`src/components/AppSidebar.tsx`)
- Shows current user's role
- Shows truncated user ID
- Logout button

### Data Flow

```
User Login
    ↓
[LoginPage Form Input]
    ↓
[authApi.login(username, password)]
    ↓
[Backend: POST /auth/login]
    ↓
[Store token + user info]
    ↓
[Redirect to /projects]
    ↓
[All API requests include Authorization header]
    ↓
[Axios interceptor handles 401/403 errors]
```

## API Contract

### Login Request
```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Login Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-25T22:28:31.123Z",
  "role": "ADMIN",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "professorId": null
}
```

### Field Descriptions
- **token** (string): JWT token for authorization
- **expiresAt** (ISO 8601 string): Token expiration time
- **role** (string): User role - "ADMIN" or "PROFESSOR"
- **userId** (UUID): Unique user identifier
- **professorId** (UUID | null): Professor ID if user is a professor

### Error Response (401)
```json
{
  "message": "Invalid username or password"
}
```

## Authentication Flow

### 1. Login
- User submits credentials
- Frontend calls `POST /auth/login`
- Backend validates and returns JWT + metadata
- Frontend stores in localStorage and updates context
- User redirected to /projects

### 2. Authenticated Requests
- Axios interceptor adds: `Authorization: Bearer {token}`
- Backend validates token
- Request proceeds or returns 401/403

### 3. Token Expiry
- Frontend checks `expiresAt` on component mount
- If expired, user is automatically logged out
- User redirected to login page

### 4. Logout
- User clicks logout button
- localStorage is cleared
- Auth context is reset
- User redirected to login page

## Storage

### localStorage Keys
- `accessToken`: JWT token
- `authUser`: JSON-encoded user object with metadata

### Data Structure
```typescript
// localStorage: authUser
{
  userId: "550e8400-e29b-41d4-a716-446655440000",
  role: "ADMIN",
  professorId: null,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresAt: "2025-10-25T22:28:31.123Z"
}
```

## Error Handling

### 401 Unauthorized
- Clears localStorage
- Redirects to login
- Triggered by: missing token, invalid token, expired token

### 403 Forbidden
- Shows error toast
- User remains logged in
- Triggered by: insufficient permissions

### Other Errors (4xx, 5xx)
- Shows error toast
- Maintains current state
- User can retry or logout

## Using Auth in Components

### Basic Usage
```tsx
import { useAuth } from '@/contexts/useAuth'

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginPage />
  }
  
  return (
    <div>
      <p>Role: {user?.role}</p>
      <p>User ID: {user?.userId}</p>
      {user?.professorId && <p>Professor ID: {user.professorId}</p>}
    </div>
  )
}
```

### Role-Based Rendering
```tsx
function AdminOnly() {
  const { user } = useAuth()
  
  if (user?.role !== 'ADMIN') {
    return <p>Access Denied</p>
  }
  
  return <AdminPanel />
}
```

### Professor-Specific Features
```tsx
function ProfessorFeatures() {
  const { user } = useAuth()
  
  if (!user?.professorId) {
    return <p>Available only for professors</p>
  }
  
  return <ProfessorPanel professorId={user.professorId} />
}
```

## Protected Routes

All routes are automatically protected:

```tsx
<Route
  path="/projects"
  element={
    <ProtectedRoute>
      <ProjectsPage />
    </ProtectedRoute>
  }
/>
```

Only the login route is public:
```tsx
<Route path="/login" element={<LoginPage />} />
```

## Interceptors

### Request Interceptor
- Adds `Authorization: Bearer {token}` header to all requests
- Only if token exists in localStorage

### Response Interceptor
- On 401: clears auth and redirects to login
- On 403: shows error toast
- On other errors: shows error toast
- Deduplicates toasts within 4 seconds

## Environment Configuration

### .env
```
VITE_API_BASE_URL=http://localhost:8080
```

Change this to point to your backend API.

## Token Management

### Storage
- Stored in localStorage (vulnerable to XSS if not careful)
- Not sent to external domains

### Transmission
- Sent via `Authorization: Bearer {token}` header
- Sent on every API request

### Expiry
- Checked on component mount
- Also validated by backend on each request
- If expired: auto-logout and redirect

### Refresh
- Currently: no refresh token (login again when expired)
- Future: will implement refresh token endpoint

## Testing

### Manual Testing
1. Open http://localhost:5173
2. Login with admin/admin123
3. Open DevTools → Network tab
4. Make API request and check Authorization header
5. Click logout button

### Testing Token Expiry
1. Login successfully
2. Open DevTools → Application → localStorage
3. Edit `authUser` and change `expiresAt` to past date
4. Refresh page
5. Should be redirected to login

### Testing 401
1. Manually delete `accessToken` from localStorage
2. Try to access protected route
3. Should redirect to login

### Testing 403
1. Login as professor without permission for resource
2. Try to perform unauthorized action
3. Should see error toast

## Troubleshooting

### "useAuth must be used within an AuthProvider"
- Ensure `<AuthProvider>` wraps your app in main.tsx
- Check that component using hook is inside AuthProvider

### Login redirects to login instead of projects
- Check that backend returns correct response shape
- Check `expiresAt` is valid ISO 8601 date string
- Check `role` is "ADMIN" or "PROFESSOR"

### Token not included in requests
- Check localStorage has `accessToken` key
- Check axios interceptor is loaded (should show in Network → Headers)
- Check Authorization header format: `Bearer {token}`

### Stuck on login page after successful login
- Check browser console for errors
- Check that navigate() is working
- Verify `ROUTES.projects` is `/projects`

### Logout doesn't work
- Check logout button click handler
- Verify localStorage is being cleared
- Check redirect to login happens

## File Locations

```
src/
├── api/
│   ├── auth.ts                     # Login API
│   └── axios.ts                    # Interceptors
├── components/
│   ├── ProtectedRoute.tsx          # Route protection
│   └── AppSidebar.tsx              # Updated with logout
├── contexts/
│   ├── AuthContextDefinition.ts    # Context type
│   ├── AuthContext.tsx             # Provider
│   └── useAuth.ts                  # Hook
├── pages/
│   └── LoginPage.tsx               # Login UI
├── types/
│   └── Auth.ts                     # TypeScript types
└── main.tsx                        # Router + providers

Documentation:
├── AUTH_IMPLEMENTATION.md          # Detailed guide
├── BACKEND_AUTH_INTEGRATION.md    # Backend guide
└── AUTH_SUMMARY.md                # Implementation summary
```

## Best Practices

### Do's
✅ Always use `useAuth()` hook to access auth state
✅ Protect routes that require authentication
✅ Use role checks before showing sensitive features
✅ Clear auth on 401 responses
✅ Show user-friendly error messages
✅ Handle loading states properly

### Don'ts
❌ Don't store token in sessionStorage (not persistent)
❌ Don't include token in URLs
❌ Don't bypass ProtectedRoute for sensitive pages
❌ Don't trust frontend role checks alone (always validate on backend)
❌ Don't expose sensitive data in error messages
❌ Don't implement custom auth when useAuth hook is available

## Future Enhancements

- [ ] Implement refresh token endpoint
- [ ] Add password reset flow
- [ ] Add "remember me" functionality
- [ ] Implement 2FA
- [ ] Switch to HTTP-only cookies
- [ ] Add session timeout warnings
- [ ] Add permission checking before API calls
- [ ] Add role-based UI feature flags

## Support & Questions

Refer to:
- `AUTH_IMPLEMENTATION.md` for detailed architecture
- `BACKEND_AUTH_INTEGRATION.md` for backend integration
- TypeScript types in `src/types/Auth.ts` for API contracts
