import { useQuery } from "@tanstack/react-query";
import { getUserDetailsByID } from "../utils/api";

export function useGetUserDetails(userId, accessToken) {
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["userDetails", userId],
    queryFn: () => {
      if (userId) return getUserDetailsByID(userId, accessToken);
      return null;
    },
    staleTime: 1000 * 60 * 20, // 1 second
    
    
  });
  return { isLoading, data, error, status, refetch, isFetching };
}

