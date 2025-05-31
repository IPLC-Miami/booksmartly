import { useQuery } from "@tanstack/react-query";
import { getHistoryForClinician } from "../utils/api"; // Assuming this function in api.js will be renamed
export default function useGetHistoryForClinician(clinicianId) { // Renamed parameter
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["clinician_queue_history", clinicianId], // Updated queryKey
    queryFn: () => {
      if (clinicianId) return getHistoryForClinician(clinicianId);
      return null;
    },
    staleTime: 1000 * 20, // 20 second
  });
  return { isLoading, data, error, status, refetch, isFetching };
}