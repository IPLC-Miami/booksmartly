import { useQuery } from "@tanstack/react-query";
// import { getUserRoleById } from "../utils/api";
// import { getDoctorSlots } from "../utils/api";
import { getUserRoleById } from "../utils/api";

// AUTHENTICATION DISABLED: This hook has been disabled to remove role-based authentication
// Original functionality: Fetched user role by ID for authorization checks
// New behavior: Returns mock data indicating no role restrictions

export default function useUserRoleById(userId, token) {
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["UserRole", userId],
    queryFn: () => {
      // DISABLED: No longer fetch user role from API
      // if (userId && token) return getUserRoleById(userId, token);
      // return null;
      
      // Return mock role data - assume user has all permissions
      return {
        role: 'admin', // Grant admin role to bypass all role checks
        permissions: ['all'], // Grant all permissions
        userId: userId
      };
    },
    enabled: true, // Always enabled, no longer depends on userId and token
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 0, // No retries needed for mock data
  });

  // Return mock successful state
  return { 
    isLoading: false, // Never loading since we return mock data
    data: {
      role: 'admin',
      permissions: ['all'],
      userId: userId
    }, 
    error: null, // No errors with mock data
    status: 'success', // Always successful
    refetch, 
    isFetching: false // Never fetching since we return mock data
  };
}