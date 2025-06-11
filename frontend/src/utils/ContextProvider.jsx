import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

// Create AuthContext
const AuthContext = createContext({
  user: null,
  userRole: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {}
})

// Custom hook to use AuthContext
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthContextProvider')
  }
  return context
}

// Helper function to get user role from database
const getUserRole = async (userId) => {
  try {
    // Debug logging for role detection
    console.log('🚨 CONTEXT PROVIDER getUserRole CALLED FOR:', userId)
    console.log('🔍 getUserRole called for userId:', userId)
    
    // First, try to get role from user metadata (for test users and new auth system)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('📋 User metadata check:', {
      userId: user?.id,
      targetUserId: userId,
      rawMetaData: user?.raw_user_meta_data,
      role: user?.raw_user_meta_data?.role,
      userError
    })
    
    if (user && user.id === userId && user.raw_user_meta_data?.role) {
      console.log('✅ Found role in metadata:', user.raw_user_meta_data.role)
      return user.raw_user_meta_data.role
    }

    console.log('⚠️ No role in metadata, checking database tables...')

    // Fallback to database tables for existing users
    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    console.log('🔍 Admin check:', { adminData, adminError })
    if (adminData && !adminError) {
      console.log('✅ Found admin role in database')
      return 'admin'
    }

    // Check if user is clinician
    const { data: clinicianData, error: clinicianError } = await supabase
      .from('clinicians')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    console.log('🔍 Clinician check:', { clinicianData, clinicianError })
    if (clinicianData && !clinicianError) {
      console.log('✅ Found clinician role in database')
      return 'clinician'
    }

    // Check if user is client
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .single()
    
    console.log('🔍 Client check:', { clientData, clientError })
    if (clientData && !clientError) {
      console.log('✅ Found client role in database')
      return 'client'
    }

    // Default to client if no specific role found
    console.log('⚠️ No role found anywhere, defaulting to client')
    return 'client'
  } catch (error) {
    console.error('❌ Error getting user role:', error)
    return 'client'
  }
}

// AuthContextProvider component
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setUserRole(null)
        } else if (session?.user) {
          setUser(session.user)
          const role = await getUserRole(session.user.id)
          setUserRole(role)
        } else {
          setUser(null)
          setUserRole(null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
        setUserRole(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          const role = await getUserRole(session.user.id)
          setUserRole(role)
        } else {
          setUser(null)
          setUserRole(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Sign in function
  const signIn = async (email, password) => {
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

  // Sign up function
  const signUp = async (email, password, options = {}) => {
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

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      setUser(null)
      setUserRole(null)
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  }

  // Reset password function
  const resetPassword = async (email) => {
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

  // Update password function
  const updatePassword = async (newPassword) => {
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

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export const useBookSmartlyContext = useAuthContext
export default AuthContextProvider
