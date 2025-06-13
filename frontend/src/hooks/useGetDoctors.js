import { useQuery } from "@tanstack/react-query";
import { getDoctors } from "../utils/api";

export default function useGetDoctors() {
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["doctors"],
    queryFn: getDoctors,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  return { isLoading, data, error, status, refetch, isFetching };
}