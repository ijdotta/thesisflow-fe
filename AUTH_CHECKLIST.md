# Authentication Implementation - Checklist & Quick Start

## ✅ What's Been Done

- [x] Auth context and state management
- [x] Login page UI
- [x] Route protection
- [x] Axios request/response interceptors
- [x] Token storage and persistence
- [x] Token expiry detection
- [x] Logout functionality
- [x] User info display in sidebar
- [x] Error handling (401/403)
- [x] TypeScript types
- [x] ESLint compliance
- [x] Documentation

## 🚀 Next Steps for Integration

### Backend Team

1. **Implement `/auth/login` endpoint**
   - Accept: `{ username, password }`
   - Return: `{ token, expiresAt, role, userId, professorId? }`
   - Reference: `BACKEND_AUTH_INTEGRATION.md`

2. **Seed admin user**
   - Username: `admin`
   - Password: `admin123` (change in production!)

3. **Add JWT validation to other endpoints**
   - Read token from `Authorization: Bearer {token}` header
   - Return 401 if invalid/expired
   - Return 403 if insufficient permissions

### Frontend Team

1. **Test locally**
   ```bash
   npm run dev
   # Navigate to http://localhost:5173
   # Login with admin/admin123
   # You should see projects page
   ```

2. **Verify interceptors work**
   ```bash
   # In browser DevTools → Network tab
   # Make any API request
   # Check Authorization header is present
   ```

3. **Test error cases**
   - Delete `accessToken` from localStorage → should redirect to login
   - Send invalid token → should get 401 → should redirect to login
   - Try unauthorized action → should get 403 → should show error

### Both Teams

1. **Test full flow**
   - Backend starts
   - Frontend starts
   - Login works
   - API calls include token
   - Token expiry works
   - Logout works

2. **Test error scenarios**
   - Invalid credentials → 401 + error message
   - Expired token → auto-logout
   - Unauthorized action → 403 + error message

3. **Prepare for deployment**
   - Update `.env` to production API URL
   - Change admin password
   - Set JWT_SECRET on backend
   - Enable CORS if needed

## 📋 Quick Reference

### Key Files
- **Login**: `src/pages/LoginPage.tsx`
- **Context**: `src/contexts/AuthContext.tsx`
- **Hook**: `src/contexts/useAuth.ts`
- **API**: `src/api/auth.ts`
- **Interceptors**: `src/api/axios.ts`

### API Endpoint
```
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Using Auth in Code
```tsx
import { useAuth } from '@/contexts/useAuth'

function MyComponent() {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth()
  
  if (!isAuthenticated) return <LoginPage />
  
  return <div>Hello {user?.role}</div>
}
```

### Accessing User Info
- `user.role` - "ADMIN" or "PROFESSOR"
- `user.userId` - Unique user ID
- `user.professorId` - Professor ID (if applicable)
- `user.token` - JWT token
- `user.expiresAt` - Token expiration time

## 🔍 Testing Commands

### Test Backend Endpoint
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Protected API with Token
```bash
TOKEN="your-token-here"
curl http://localhost:8080/projects \
  -H "Authorization: Bearer $TOKEN"
```

## 🛠️ Development

### Run Development Server
```bash
npm run dev
# Opens at http://localhost:5173
```

### Build for Production
```bash
npm run build
# Creates dist/ directory
```

### Run Linter
```bash
npm run lint
# Should show 0 auth-related issues
```

### Run Tests
```bash
npm test
```

## 📚 Documentation

Read these files for detailed information:

1. **AUTH_README.md** - Complete guide
2. **AUTH_IMPLEMENTATION.md** - Architecture details
3. **BACKEND_AUTH_INTEGRATION.md** - Backend integration
4. **AUTH_SUMMARY.md** - Implementation summary

## ❓ Common Issues

| Issue | Solution |
|-------|----------|
| "useAuth must be used within AuthProvider" | Ensure AuthProvider wraps app in main.tsx |
| Login redirects back to login | Check backend returns correct response shape |
| Token not included in requests | Check localStorage has `accessToken` key |
| Stuck on login page | Check browser console for errors |
| Logout doesn't work | Check localStorage is cleared |

## 🔐 Security Reminders

- [ ] Token stored in localStorage (remember XSS vulnerability)
- [ ] All routes protected except login
- [ ] Token sent on every request
- [ ] 401 triggers auto-logout
- [ ] Plan for refresh token endpoint
- [ ] Change default admin password in production
- [ ] Set JWT_SECRET in production

## 📞 Support

Need help? Check:
1. Browser console for errors
2. Network tab for request/response
3. localStorage for token presence
4. Documentation files (AUTH_*.md)

## Status

✅ **Ready for Integration**

The frontend is ready to integrate with your backend. Implement the `/auth/login` endpoint and test the full flow.
