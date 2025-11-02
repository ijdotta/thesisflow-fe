# Error Handling Pages & Components

## Overview

A complete error handling system with cute, user-friendly error pages and components. Includes specialized pages for common HTTP errors and a comprehensive error boundary.

## Features

- ✅ Cute, friendly error page UI with gradient backgrounds
- ✅ Error boundary for catching React component errors
- ✅ Custom error handler hook for API errors
- ✅ Predefined pages for common HTTP status codes
- ✅ Automatic error navigation
- ✅ Error details display
- ✅ Action buttons for recovery

## Components

### ErrorPage
Base error page component that displays error information.

```tsx
import { ErrorPage } from '@/components/ErrorPage'

<ErrorPage
  statusCode={404}
  title="Not Found"
  description="The page you're looking for doesn't exist."
  details="Optional additional details about the error"
  action={{ label: "Go Home", href: "/projects" }}
/>
```

**Props:**
- `statusCode` (number) - HTTP status code to display
- `title` (string) - Error title
- `description` (string) - Main error description
- `details?` (string) - Optional additional details
- `action?` (object) - Optional action button
  - `label` - Button text
  - `href` - Link destination

### ErrorPages
Predefined error page components for common scenarios.

```tsx
import { 
  NotFoundPage, 
  ForbiddenPage, 
  UnauthorizedPage,
  ServerErrorPage,
  BadRequestPage 
} from '@/components/ErrorPages'

// Use directly
<NotFoundPage />
<ForbiddenPage />
<UnauthorizedPage />
<ServerErrorPage />
<BadRequestPage />
```

**Available Pages:**
- **NotFoundPage** - 404 errors
- **ForbiddenPage** - 403 access denied
- **UnauthorizedPage** - 401 authentication required
- **ServerErrorPage** - 500 server errors
- **BadRequestPage** - 400 validation errors

### ErrorBoundary
React error boundary component that catches component errors.

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches React component errors
- Displays friendly error UI
- Shows error message
- Provides recovery buttons
- Logs errors to console

## Hooks

### useErrorHandler
Hook for handling API errors with automatic navigation and toasts.

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler'

function MyComponent() {
  const { handleError } = useErrorHandler()

  const fetchData = async () => {
    try {
      const response = await api.get('/data')
      // handle response
    } catch (error) {
      handleError(error)  // Automatically handles 400, 401, 403, 500, etc.
    }
  }

  return <button onClick={fetchData}>Fetch</button>
}
```

**Error Handling:**
- **400** - Shows "Bad Request" toast
- **401** - Shows "Session expired" message, redirects to login
- **403** - Shows "Access Denied", navigates to forbidden page
- **404** - Shows "Resource not found", navigates to 404 page
- **409** - Shows "Conflict" message
- **422** - Shows "Validation Error" message
- **429** - Shows "Too many requests" message
- **500** - Shows "Server error", navigates to error page
- **503** - Shows "Service unavailable" message
- **Other** - Shows generic error message

## Routes

Error pages are automatically added to routes:

```tsx
<Route path="/not-found" element={<NotFoundPage />} />
<Route path="/forbidden" element={<ForbiddenPage />} />
<Route path="/server-error" element={<ServerErrorPage />} />
<Route path="*" element={<NotFoundPage />} />  // Catch-all
```

## Usage Examples

### Example 1: Using Error Pages Directly
```tsx
import { ForbiddenPage } from '@/pages/ErrorPages'

function MyComponent() {
  const { user } = useAuth()
  
  if (user?.role !== 'ADMIN') {
    return <ForbiddenPage />
  }
  
  return <AdminPanel />
}
```

### Example 2: Using Error Handler Hook
```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { api } from '@/api/axios'

function UserList() {
  const { handleError } = useErrorHandler()

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data)
    } catch (error) {
      handleError(error)
    }
  }

  return <button onClick={fetchUsers}>Load Users</button>
}
```

### Example 3: Using Error Boundary
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <Header />
      <Content />
      <Footer />
    </ErrorBoundary>
  )
}
```

### Example 4: Custom Error Page
```tsx
import { ErrorPage } from '@/components/ErrorPage'

function CustomErrorPage() {
  return (
    <ErrorPage
      statusCode={429}
      title="Rate Limit Exceeded"
      description="You're making too many requests."
      details="Please wait a few minutes before trying again."
      action={{ label: "Back", href: "/" }}
    />
  )
}
```

## Styling

All error pages feature:
- Gradient backgrounds for visual appeal
- Centered layout with responsive padding
- Animated icons with blur effects
- Smooth hover transitions on buttons
- Accessible color contrast

## Customization

### Custom Error Page
Create a new error page by using the base ErrorPage component:

```tsx
import { ErrorPage } from '@/components/ErrorPage'

export function CustomError() {
  return (
    <ErrorPage
      statusCode={418}
      title="I'm a Teapot"
      description="This server is a teapot."
      details="See RFC 2324 Section 2.3.2"
      action={{ label: "Continue", href: "/projects" }}
    />
  )
}
```

### Custom Error Handler
Extend useErrorHandler for custom logic:

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler'

function useCustomErrorHandler() {
  const { handleError } = useErrorHandler()

  const customHandle = (error: unknown) => {
    // Add custom logic
    console.log('Custom error handling')
    handleError(error)
  }

  return { customHandle }
}
```

## Best Practices

✅ **Do:**
- Use ErrorBoundary at top level of app
- Use useErrorHandler in API calls
- Show user-friendly error messages
- Provide action buttons for recovery
- Log errors for debugging

❌ **Don't:**
- Show raw error messages to users
- Ignore errors without feedback
- Leave users on error page without action
- Store sensitive info in error messages

## File Structure

```
src/
├── components/
│   ├── ErrorPage.tsx          # Base error page component
│   ├── ErrorPages.tsx         # Predefined error pages
│   └── ErrorBoundary.tsx      # Error boundary component
├── hooks/
│   └── useErrorHandler.ts     # Error handling hook
├── pages/
│   └── ErrorPages.tsx         # Error page exports
└── main.tsx                   # Routes with error pages
```

## Future Enhancements

- [ ] Error logging service integration
- [ ] Detailed error stack traces (dev only)
- [ ] Error recovery suggestions
- [ ] Multiple language support
- [ ] Custom error analytics

## Support

For questions about error handling, refer to the specific component or hook documentation above.
