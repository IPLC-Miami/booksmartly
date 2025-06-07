import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from './ContextProvider'

// Basic protected route component
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Role-based protected route component
export const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, userRole, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoutes = {
      admin: '/admin-dashboard',
      clinician: '/clinician-dashboard',
      client: '/patient-dashboard'
    }
    
    const redirectPath = dashboardRoutes[userRole] || '/patient-dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

// Enhanced protected route with role checking and custom redirects
export const EnhancedProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectPath = null,
  requireAuth = true 
}) => {
  const { user, userRole, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If user is authenticated but doesn't have required role
  if (user && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />
    }
    
    // Default role-based redirects
    const dashboardRoutes = {
      admin: '/admin-dashboard',
      clinician: '/clinician-dashboard',
      client: '/patient-dashboard'
    }
    
    const defaultRedirect = dashboardRoutes[userRole] || '/patient-dashboard'
    return <Navigate to={defaultRedirect} replace />
  }

  return children
}

// Public route component (for login/signup pages when user is already authenticated)
export const PublicRoute = ({ children }) => {
  const { user, userRole, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (user) {
    // Redirect authenticated users to their dashboard
    const dashboardRoutes = {
      admin: '/admin-dashboard',
      clinician: '/clinician-dashboard',
      client: '/patient-dashboard'
    }
    
    const redirectPath = dashboardRoutes[userRole] || '/patient-dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

// Admin only route
export const AdminRoute = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={['admin']}>
      {children}
    </RoleBasedRoute>
  )
}

// Clinician only route
export const ClinicianRoute = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={['clinician']}>
      {children}
    </RoleBasedRoute>
  )
}

// Client only route
export const ClientRoute = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={['client']}>
      {children}
    </RoleBasedRoute>
  )
}

// Staff route (admin + clinician)
export const StaffRoute = ({ children }) => {
  return (
    <RoleBasedRoute allowedRoles={['admin', 'clinician']}>
      {children}
    </RoleBasedRoute>
  )
}

export default ProtectedRoute