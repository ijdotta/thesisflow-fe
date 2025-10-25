# Frontend Auth Integration Guide for Backend Team

## Summary
The frontend has been configured with JWT-based authentication. It expects the backend to provide a `/auth/login` endpoint that returns a JWT token plus user metadata.

## Login Request/Response Contract

### Request
```
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-25T22:28:31.123Z",
  "role": "ADMIN",
  "userId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "professorId": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1"
}
```

### Response Fields
- `token` (string, required): JWT token to be used in `Authorization: Bearer {token}` header
- `expiresAt` (ISO 8601 datetime string, required): When token expires
- `role` (string, required): User role - "ADMIN" or "PROFESSOR"
- `userId` (UUID string, required): User's unique identifier
- `professorId` (UUID string, optional): Professor's unique identifier, present only if user is linked to a professor account

### Error Responses

**401 Unauthorized** (Invalid credentials)
```json
{
  "message": "Invalid username or password"
}
```

**400 Bad Request** (Missing/invalid fields)
```json
{
  "message": "Username and password are required"
}
```

## Authentication Flow

1. Frontend sends credentials to `/auth/login`
2. Backend validates credentials and generates JWT token
3. Frontend stores token in localStorage as `accessToken` and user info as `authUser`
4. Frontend attaches token to all subsequent requests: `Authorization: Bearer {token}`
5. Backend validates token on each request
6. If token is expired or invalid, backend returns 401
7. Frontend detects 401 and redirects user to login

## Authorization

The backend already implements:
- 401 for missing/invalid tokens
- 403 for insufficient permissions
- Frontend displays appropriate error messages for both cases

## Frontend Expectations

### Token Usage
- Frontend expects token in `Authorization: Bearer {token}` header
- Frontend will automatically add this header to all API calls via axios interceptor
- No need to send token in request body

### Token Expiry Handling
- Frontend checks `expiresAt` on component mount
- Frontend also catches 401 responses and redirects to login
- No refresh token endpoint needed yet (but recommended for future)

### Role-Based Authorization
- Frontend will display UI based on `role` field
- Frontend may make decisions based on `professorId` presence
- Backend still enforces authorization (403) on restricted endpoints

## Environment Setup

The frontend is configured to call the backend at:
```
http://localhost:8080
```

This can be changed in `.env`:
```
VITE_API_BASE_URL=http://your-backend-url
```

## Testing

### 1. Test Login Endpoint
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Test Frontend Login
1. Start frontend: `npm run dev`
2. Navigate to http://localhost:5173
3. You should see login page
4. Enter admin/admin123
5. You should be redirected to projects page

### 3. Test Token in Requests
Frontend will automatically add token:
```bash
# Check what token is being sent
# Open browser DevTools -> Network tab
# Filter for API requests and check Authorization header
```

## Seeded Admin Account

The backend spec mentions a seeded admin account:
- Username: `admin`
- Password: `admin123`

**Important**: Change these credentials before production deployment!

## Common Issues

### Frontend redirects to login but shouldn't
- Check that login response includes all required fields
- Check that `expiresAt` is a valid ISO 8601 datetime string
- Check browser localStorage for `accessToken` and `authUser`

### Frontend accepts login but gets 401 on next request
- Check that token is being validated correctly on backend
- Check that Authorization header is being read correctly (case-sensitive)
- Verify JWT secret is the same for both token generation and validation

### Logout on page refresh
- Check that `expiresAt` is valid and in the future
- Verify localStorage is persisting between requests

## Frontend Architecture

### Auth Context
- Global state for authentication
- Available via `useAuth()` hook
- Automatically syncs with localStorage

### Protected Routes
- All routes except `/login` require authentication
- Unauthenticated users are redirected to `/login`

### Axios Interceptor
- Automatically adds `Authorization: Bearer {token}` to all requests
- On 401: clears auth and redirects to login
- On 403: shows error message

## Questions?

For frontend-specific auth questions, refer to `AUTH_IMPLEMENTATION.md` in the project root.
