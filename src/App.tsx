import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { AdminLogin } from './pages/AdminLogin'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminWineForm } from './pages/AdminWineForm'
import { useAuth } from './hooks/useAuth'

function getInitialTheme(): 'dark' | 'light' {
  return (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark'
}

function RequireAuth({ children, auth }: { children: React.ReactNode; auth: ReturnType<typeof useAuth> }) {
  if (!auth.isAuthenticated) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(getInitialTheme)
  const auth = useAuth()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <Routes>
      <Route path="/" element={<Home theme={theme} onToggleTheme={toggleTheme} />} />
      <Route path="/admin/login" element={<AdminLogin auth={auth} />} />
      <Route
        path="/admin"
        element={
          <RequireAuth auth={auth}>
            <AdminDashboard auth={auth} theme={theme} onToggleTheme={toggleTheme} />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/vins/nouveau"
        element={
          <RequireAuth auth={auth}>
            <AdminWineForm auth={auth} />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/vins/:id/modifier"
        element={
          <RequireAuth auth={auth}>
            <AdminWineForm auth={auth} />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
