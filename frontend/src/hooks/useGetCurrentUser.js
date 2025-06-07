import { useState, useEffect } from 'react'
import { useAuthContext } from '../utils/ContextProvider'
import { getCurrentUserWithRole } from '../utils/authHelper'

// Hook to get current user with role information
export const useGetCurrentUser = () => {
  const { user, userRole, loading } = useAuthContext()
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (user && userRole) {
          // User data is available from context
          setUserData({
            user,
            role: userRole,
            isAuthenticated: true
          })
        } else if (!loading) {
          // Context has finished loading but no user found
          setUserData({
            user: null,
            role: null,
            isAuthenticated: false
          })
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(err)
        setUserData({
          user: null,
          role: null,
          isAuthenticated: false
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user, userRole, loading])

  return {
    userData,
    isLoading: loading || isLoading,
    error,
    refetch: async () => {
      const result = await getCurrentUserWithRole()
      setUserData({
        user: result.user,
        role: result.role,
        isAuthenticated: !!result.user
      })
    }
  }
}

export default useGetCurrentUser