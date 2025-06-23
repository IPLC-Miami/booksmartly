import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  getCurrentUser,
  getUserRole as getComprehensiveUserRole,
  isAuthenticated,
  signInWithEmail,
  signUpWithEmail,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  getAuthToken
} from './authHelper'

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

// Helper function to get user role from JWT token
const getUserRole = async (user) => {
  if (!user) return null;
  
  try {
    // The role should be in the JWT token already
    if (user.role) {
      console.log('🔍 Role detected for user:', user.email, 'Role:', user.role);
      return user.role;
    }
    
    // Fallback to comprehensive role detection if needed
    const role = await getComprehensiveUserRole(user.id);
    console.log('🔍 Role detected for user:', user.email, 'Role:', role);
    return role;
  } catch (error) {
    console.error('Error getting user role:', error);
    // Default role if detection fails
    return 'client';
  }
}

// AuthContextProvider component
export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session from localStorage token
    const getInitialSession = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            const role = await getUserRole(currentUser);
            setUserRole(role);
            console.log('🔐 Initial session loaded:', currentUser.email, 'Role:', role);
          } else {
            setUser(null);
            setUserRole(null);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();
  }, [])

  // Sign in function
  const signIn = async (email, password) => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      const response = await signInWithEmail(email, password);
      
      if (response.success && response.token) {
        // Get user from token
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const role = await getUserRole(currentUser);
          setUserRole(role);
          console.log('🔐 Sign in successful:', currentUser.email, 'Role:', role);
        }
        return { data: response, error: null };
      } else {
        console.error('🔐 Sign in failed:', response.error || response.message);
        return { data: null, error: response.error || response.message || 'Login failed' };
      }
    } catch (error) {
      console.error('🔐 Sign in error:', error);
      return { data: null, error: error.message || 'Login failed' };
    }
  }

  // Sign up function
  const signUp = async (email, password, options = {}) => {
    try {
      console.log('🔐 Attempting sign up for:', email);
      const response = await signUpWithEmail(email, password, options);
      
      if (response.success) {
        return { data: response, error: null };
      } else {
        console.error('🔐 Sign up failed:', response.error || response.message);
        return { data: null, error: response.error || response.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('🔐 Sign up error:', error);
      return { data: null, error: error.message || 'Signup failed' };
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      console.log('🔐 Signing out user:', user?.email);
      authSignOut(); // Remove token from localStorage
      setUser(null);
      setUserRole(null);
      console.log('🔐 Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('🔐 Sign out error:', error);
      return { error: error.message || 'Logout failed' };
    }
  }

  // Reset password function
  const resetPassword = async (email) => {
    try {
      console.log('🔐 Attempting password reset for:', email);
      const response = await authResetPassword(email);
      
      if (response.success) {
        return { data: response, error: null };
      } else {
        console.error('🔐 Password reset failed:', response.error || response.message);
        return { data: null, error: response.error || response.message || 'Password reset failed' };
      }
    } catch (error) {
      console.error('🔐 Reset password error:', error);
      return { data: null, error: error.message || 'Password reset failed' };
    }
  }

  // Update password function
  const updatePassword = async (newPassword) => {
    try {
      console.log('🔐 Attempting password update for user:', user?.email);
      const response = await authUpdatePassword(newPassword);
      
      if (response.success) {
        return { data: response, error: null };
      } else {
        console.error('🔐 Password update failed:', response.error || response.message);
        return { data: null, error: response.error || response.message || 'Password update failed' };
      }
    } catch (error) {
      console.error('🔐 Update password error:', error);
      return { data: null, error: error.message || 'Password update failed' };
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
