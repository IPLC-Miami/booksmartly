import { useQuery } from "@tanstack/react-query";
import { getPatientAppointments } from "../utils/api";

export default function useGetUpcomingAppointments(patientId) {
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["patient_appointments", patientId],
    queryFn: () => {
      if (patientId) return getPatientAppointments(patientId);
      return null;
    },
    staleTime: 1000 * 1, // 1 second
  });
  return { isLoading, data, error, status, refetch, isFetching };
}

