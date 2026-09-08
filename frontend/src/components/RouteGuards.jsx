import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export function ProtectedRoute() {
  const { accessToken } = useAuthStore()
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicRoute() {
  const { accessToken } = useAuthStore()
  return accessToken ? <Navigate to="/dashboard" replace /> : <Outlet />
}
