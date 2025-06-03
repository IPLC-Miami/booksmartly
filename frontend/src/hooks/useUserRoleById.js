import { useQuery } from "@tanstack/react-query";
// import { getUserRoleById } from "../utils/api";
// import { getDoctorSlots } from "../utils/api";
import { getUserRoleById } from "../utils/api";
export default function useUserRoleById(userId, token) {
  // TEMP: Skip role query to fix timeout - return no role immediately
  return {
    isLoading: false,
    data: null,
    error: null,
    status: 'success',
    refetch: () => {},
    isFetching: false
  };
  
  // ORIGINAL CODE COMMENTED OUT TO FIX TIMEOUT
  /*
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["UserRole", userId],
    queryFn: () => {
      if (userId) return getUserRoleById(userId, token);
      return null;
    },
    staleTime: 1000 * 1, // 1 second
  });
  return { isLoading, data, error, status, refetch, isFetching };
  */
}

