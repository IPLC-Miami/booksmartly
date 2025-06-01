import {useQuery} from "@tanstack/react-query";
import {getPrescription} from "../utils/api";
export default function useGetPrescription(appointmentId) {
  const {isLoading, data, error, status, refetch, isFetching} = useQuery({
    queryKey: ["prescription", appointmentId],
    queryFn: () => {
      if (appointmentId) return getPrescription(appointmentId);
      return null;
    },
    staleTime: 1000 * 1, // 1 second
  });
  return {isLoading, data, error, status, refetch, isFetching};
}
