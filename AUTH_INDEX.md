# Authentication Documentation Index

Welcome! This guide will help you navigate all authentication documentation.

## Quick Navigation

### 🎯 Start Here
- **[AUTH_CHECKLIST.md](AUTH_CHECKLIST.md)** - Quick start checklist and 2-minute overview

### 📖 Main Documentation
1. **[AUTH_README.md](AUTH_README.md)** - Complete user guide (~15 min read)
   - Overview
   - Architecture
   - API contract
   - Usage examples
   - Troubleshooting

2. **[AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md)** - Technical deep dive (~20 min read)
   - Component details
   - Context management
   - API integration
   - Error handling
   - Future enhancements

3. **[BACKEND_AUTH_INTEGRATION.md](BACKEND_AUTH_INTEGRATION.md)** - Backend team guide (~10 min read)
   - API contract
   - Authentication flow
   - Authorization
   - Integration checklist
   - Common issues

### 📋 Additional Resources
- **[AUTH_SUMMARY.md](AUTH_SUMMARY.md)** - High-level summary
- **[CHANGES.md](CHANGES.md)** - Detailed list of all changes

### 🔧 Implementation Files

#### Core Authentication
```
src/
├── api/auth.ts                      # Login API endpoint
├── types/Auth.ts                    # TypeScript interfaces
├── contexts/
│   ├── AuthContextDefinition.ts     # Context type definition
│   ├── AuthContext.tsx              # Provider component
│   └── useAuth.ts                   # Custom hook
├── pages/LoginPage.tsx              # Login UI
└── components/ProtectedRoute.tsx    # Route protection
```

#### Integration
```
src/
├── main.tsx                         # Router + AuthProvider setup
├── api/axios.ts                     # Request/response interceptors
├── components/AppSidebar.tsx        # Logout button
└── constants/routes.ts              # Route definitions
```

---

## Reading Guide by Role

### 👤 Frontend Developer
1. Read: **AUTH_CHECKLIST.md** (overview)
2. Read: **AUTH_README.md** (complete guide)
3. Reference: **AUTH_IMPLEMENTATION.md** (details)
4. Explore: Implementation files in `src/`

### 👨‍💻 Backend Developer
1. Read: **BACKEND_AUTH_INTEGRATION.md** (integration spec)
2. Reference: **AUTH_README.md** (context)
3. Key section: API Contract

### 🏗️ Project Lead
1. Read: **AUTH_SUMMARY.md** (overview)
2. Read: **CHANGES.md** (what changed)
3. Skim: **AUTH_CHECKLIST.md** (status)

---

## Key Information

### API Endpoint
```
POST /auth/login
Content-Type: application/json

Request:  { username: string, password: string }
Response: { token, expiresAt, role, userId, professorId? }
```

### Key Files
- Login UI: `src/pages/LoginPage.tsx`
- Auth Hook: `src/contexts/useAuth.ts`
- Interceptors: `src/api/axios.ts`
- Route Protection: `src/components/ProtectedRoute.tsx`

### Using Auth in Components
```tsx
import { useAuth } from '@/contexts/useAuth'

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth()
  
  if (!isAuthenticated) return <LoginPage />
  
  return <div>Welcome {user?.role}</div>
}
```

---

## Common Tasks

### "How do I login?"
→ Navigate to `/login` (auto-redirected if not authenticated)
→ Enter credentials
→ Redirected to `/projects` on success

### "How do I check if user is logged in?"
→ Use `useAuth()` hook
→ Check `isAuthenticated` property

### "How do I access user info?"
→ Use `useAuth()` hook
→ Access `user.role`, `user.userId`, `user.professorId`

### "How do I make protected routes?"
→ Wrap route with `<ProtectedRoute>`
→ Done! Unauthenticated users redirected to login

### "How do I handle 401/403 errors?"
→ Automatic! 401 logs out and redirects
→ 403 shows error toast

### "How do I logout?"
→ Call `logout()` from `useAuth()`
→ Or click logout button in sidebar

---

## Testing Endpoints

### Test Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Protected Request
```bash
TOKEN="your-token-here"
curl http://localhost:8080/projects \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

| Problem | Solution | Reference |
|---------|----------|-----------|
| "useAuth must be used within AuthProvider" | Check AuthProvider wraps app in main.tsx | AUTH_README.md |
| Login redirects to login page | Check backend response format | BACKEND_AUTH_INTEGRATION.md |
| Token not in requests | Check localStorage has `accessToken` | AUTH_IMPLEMENTATION.md |
| Logout doesn't work | Check localStorage is cleared | AUTH_CHECKLIST.md |
| Stuck on login page | Check browser console for errors | AUTH_README.md |

---

## Status

✅ **Complete and Ready for Integration**

- All code implemented
- All tests pass
- All documentation complete
- No new dependencies required
- Backward compatible

---

## Next Steps

1. **Backend**: Implement `/auth/login` endpoint
2. **Frontend**: Test integration locally
3. **Both**: Verify full flow end-to-end
4. **Prepare**: For production deployment

---

## Questions?

- **Architecture questions** → Read AUTH_IMPLEMENTATION.md
- **API questions** → Read BACKEND_AUTH_INTEGRATION.md
- **Usage questions** → Read AUTH_README.md
- **Quick overview** → Read AUTH_CHECKLIST.md

---

Happy coding! 🚀
