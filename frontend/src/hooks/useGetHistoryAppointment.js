import { useQuery } from "@tanstack/react-query";
import { getPatientAppointmentHistory } from "../utils/api";

export default function useGetHistoryAppointment(patientId) {
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["patient_appointment_history", patientId],
    queryFn: () => {
      if (patientId) return getPatientAppointmentHistory(patientId);
      return null;
    },
    staleTime: 1000 * 1, // 1 second
  });

  return { isLoading, data, error, status, refetch, isFetching };
}

