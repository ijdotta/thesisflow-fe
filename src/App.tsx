import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage, ForbiddenPage, ServerErrorPage } from '@/pages/ErrorPages'
import { RoleBasedRouter } from '@/router/RoleBasedRouter'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/server-error" element={<ServerErrorPage />} />

        {/* Protected routes - handled by RoleBasedRouter */}
        <Route path="/*" element={<RoleBasedRouter />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
