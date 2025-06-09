import { supabase } from './supabaseClient'

// Get current user from Supabase
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// Get user role from database
export const getUserRole = async (userId) => {
  try {
    if (!userId) return null

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    if (adminData && !adminError) {
      return 'admin'
    }

    // Check if user is clinician
    const { data: clinicianData, error: clinicianError } = await supabase
      .from('clinicians')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    if (clinicianData && !clinicianError) {
      return 'clinician'
    }

    // Check if user is client
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    if (clientData && !clientError) {
      return 'client'
    }

    // Default to client if no specific role found
    return 'client'
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'client'
  }
}

// Get current user with role
export const getCurrentUserWithRole = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return { user: null, role: null }

    const role = await getUserRole(user.id)
    return { user, role }
  } catch (error) {
    console.error('Error getting current user with role:', error)
    return { user: null, role: null }
  }
}

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error checking authentication:', error)
      return false
    }
    
    return !!session?.user
  } catch (error) {
    console.error('Error in isAuthenticated:', error)
    return false
  }
}

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { data: null, error }
  }
}

// Sign up with email and password
export const signUpWithEmail = async (email, password, options = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { data: null, error }
  }
}

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }

    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error }
  }
}

// Reset password
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Reset password error:', error)
    return { data: null, error }
  }
}

// Update password
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Update password error:', error)
    return { data: null, error }
  }
}

// Get auth token
export const getAuthToken = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting auth token:', error)
      return null
    }
    
    return session?.access_token || null
  } catch (error) {
    console.error('Error in getAuthToken:', error)
    return null
  }
}

// Refresh session
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('Error refreshing session:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in refreshSession:', error)
    return { data: null, error }
  }
}

// Check if user has specific role
export const hasRole = async (requiredRole) => {
  try {
    const { user, role } = await getCurrentUserWithRole()
    
    if (!user || !role) return false
    
    return role === requiredRole
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

// Check if user is admin
export const isAdmin = async () => {
  return await hasRole('admin')
}

// Check if user is clinician
export const isClinician = async () => {
  return await hasRole('clinician')
}

// Check if user is client
export const isClient = async () => {
  return await hasRole('client')
}

// Check if user is staff (admin or clinician)
export const isStaff = async () => {
  try {
    const { user, role } = await getCurrentUserWithRole()
    
    if (!user || !role) return false
    
    return role === 'admin' || role === 'clinician'
  } catch (error) {
    console.error('Error checking if user is staff:', error)
    return false
  }
}

// Get redirect path based on user role
export const getRoleBasedRedirect = (role) => {
  const redirectPaths = {
    admin: '/reception-dashboard',
    clinician: '/clinician-dashboard',
    client: '/client-dashboard'
  }
  
  return redirectPaths[role] || '/client-dashboard'
}

export default {
  getCurrentUser,
  getUserRole,
  getCurrentUserWithRole,
  isAuthenticated,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
  updatePassword,
  getAuthToken,
  refreshSession,
  hasRole,
  isAdmin,
  isClinician,
  isClient,
  isStaff,
  getRoleBasedRedirect
}