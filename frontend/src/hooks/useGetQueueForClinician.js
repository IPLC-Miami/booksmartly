import { useQuery } from "@tanstack/react-query";
import { getQueueForClinician } from "../utils/api"; // Assuming this function in api.js will be renamed

export default function useGetQueueForClinician(clinicianId, selectedDate, selectedSlot) { // Renamed parameter
  const formattedDate = selectedDate?.toISOString().split("T")[0];

  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["clinician_queue", clinicianId, formattedDate, selectedSlot?.start_time, selectedSlot?.end_time], // Updated queryKey
    queryFn: () => {
      if (clinicianId && formattedDate && selectedSlot) {
        return getQueueForClinician(clinicianId, formattedDate, selectedSlot);
      }
      return null;
    },
    enabled: !!clinicianId && !!formattedDate && !!selectedSlot,
    staleTime: 1000 * 20, // 20 seconds
  });

  return { isLoading, data, error, status, refetch, isFetching };
}
