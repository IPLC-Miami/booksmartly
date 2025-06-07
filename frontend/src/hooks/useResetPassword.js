import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'

/**
 * Custom hook for handling password reset functionality
 * Provides methods for requesting password reset and updating password
 */
export const useResetPassword = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  /**
   * Request a password reset email
   * @param {string} email - User's email address
   * @param {string} redirectTo - URL to redirect to after reset (optional)
   * @returns {Promise<{data, error}>}
   */
  const requestPasswordReset = async (email, redirectTo = null) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const options = {}
      if (redirectTo) {
        options.redirectTo = redirectTo
      } else {
        options.redirectTo = `${window.location.origin}/reset-password`
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, options)

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      setSuccess('Password reset email sent successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while requesting password reset'
      setError(errorMessage)
      console.error('Password reset request error:', err)
      return { data: null, error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update user's password (used after clicking reset link)
   * @param {string} newPassword - The new password
   * @returns {Promise<{data, error}>}
   */
  const updatePassword = async (newPassword) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      setSuccess('Password updated successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while updating password'
      setError(errorMessage)
      console.error('Password update error:', err)
      return { data: null, error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Resend verification email for signup
   * @param {string} email - User's email address
   * @param {string} redirectTo - URL to redirect to after verification (optional)
   * @returns {Promise<{data, error}>}
   */
  const resendVerificationEmail = async (email, redirectTo = null) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const options = {
        type: 'signup',
        email: email
      }

      if (redirectTo) {
        options.options = { emailRedirectTo: redirectTo }
      } else {
        options.options = { emailRedirectTo: `${window.location.origin}/account-verified` }
      }

      const { data, error } = await supabase.auth.resend(options)

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      setSuccess('Verification email sent successfully')
      return { data, error: null }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred while sending verification email'
      setError(errorMessage)
      console.error('Verification email error:', err)
      return { data: null, error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check if current session is valid for password reset
   * @returns {Promise<{isValid, session, error}>}
   */
  const checkResetSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session check error:', error)
        return { isValid: false, session: null, error }
      }

      return { isValid: !!session, session, error: null }
    } catch (err) {
      console.error('Session check error:', err)
      return { isValid: false, session: null, error: err }
    }
  }

  /**
   * Set session from URL parameters (for email links)
   * @param {string} accessToken - Access token from URL
   * @param {string} refreshToken - Refresh token from URL
   * @returns {Promise<{data, error}>}
   */
  const setSessionFromTokens = async (accessToken, refreshToken) => {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (error) {
        console.error('Session set error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Session set error:', err)
      return { data: null, error: err }
    }
  }

  /**
   * Clear current error state
   */
  const clearError = () => {
    setError(null)
  }

  /**
   * Clear current success state
   */
  const clearSuccess = () => {
    setSuccess(null)
  }

  /**
   * Clear all states
   */
  const clearStates = () => {
    setError(null)
    setSuccess(null)
    setLoading(false)
  }

  return {
    // State
    loading,
    error,
    success,
    
    // Methods
    requestPasswordReset,
    updatePassword,
    resendVerificationEmail,
    checkResetSession,
    setSessionFromTokens,
    
    // Utility methods
    clearError,
    clearSuccess,
    clearStates
  }
}

export default useResetPassword