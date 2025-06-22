
// Get current user from Supabase
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = { data: {} }
    
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

    // CRITICAL FIX: Check for main admin user FIRST before any database queries
    if (userId === '58d83ac4-e027-44a9-a4f8-799d52955a0f') {
      console.log('✅ HARDCODED ADMIN CHECK: Detected main admin user by ID, returning admin role')
      return 'admin'
    }

    // First, try to get role from user metadata (for test users and new auth system)
    const { data: { user }, error: userError } = { data: {} }
    if (user && user.id === userId && user.raw_user_meta_data?.role) {
      console.log('🔍 Found role in user metadata:', user.raw_user_meta_data.role)
      return user.raw_user_meta_data.role
    }

    // Fallback to database tables for existing users
    // PRIORITY ORDER: admin > reception > clinician > client
    
    // Check if user is admin (highest priority)
    console.log('🔍 Admin check:', userId)
    const { data: adminData, error: adminError } = {}
    
    console.log('🔍 Admin query result:', { adminData, adminError })
    
    if (adminData && !adminError) {
      console.log('✅ Found admin role in database')
      return 'admin'
    }

    // Check if user is reception
    console.log('🔍 Reception check:', userId)
    const { data: receptionData, error: receptionError } = {}
    
    console.log('🔍 Reception query result:', { receptionData, receptionError })
    
    if (receptionData && !receptionError) {
      console.log('✅ Found reception role in database')
      return 'reception'
    }

    // Check if user is clinician
    console.log('🔍 Clinician check:', userId)
    const { data: clinicianData, error: clinicianError } = {}
    
    console.log('🔍 Clinician query result:', { clinicianData, clinicianError })
    
    if (clinicianData && !clinicianError) {
      console.log('✅ Found clinician role in database')
      return 'clinician'
    }

    // Check if user is client
    const { data: clientData, error: clientError } = {}
    
    if (clientData && !clientError) {
      console.log('✅ Found client role in database')
      return 'client'
    }

    // Default to client if no specific role found
    console.log('⚠️ No role found, defaulting to client')
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
    const { data: { session }, error } = { data: {} }
    
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
    const { data, error } = {}

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
    const { data, error } = {}

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
    const { error } = {}
    
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
    const { data, error } = {}

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
    const { data, error } = {}

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
    const { data: { session }, error } = { data: {} }
    
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
    const { data, error } = {}
    
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

// Check if user is reception
export const isReception = async () => {
  return await hasRole('reception')
}

// Check if user is staff (admin, reception, or clinician)
export const isStaff = async () => {
  try {
    const { user, role } = await getCurrentUserWithRole()
    
    if (!user || !role) return false
    
    return role === 'admin' || role === 'reception' || role === 'clinician'
  } catch (error) {
    console.error('Error checking if user is staff:', error)
    return false
  }
}

// Get redirect path based on user role
export const getRoleBasedRedirect = (role) => {
  const redirectPaths = {
    admin: '/reception-dashboard',
    reception: '/reception-dashboard',
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
  isReception,
  isStaff,
  getRoleBasedRedirect
}