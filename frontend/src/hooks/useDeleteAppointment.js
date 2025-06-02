//use mutations
import {useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAppointment } from "../utils/api";
export default function useDeleteAppointment() {
    const queryClient = useQueryClient();
    const mutate = useMutation({
        mutationFn: deleteAppointment,
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['patient_appointments']});
            queryClient.invalidateQueries({queryKey: ['patient_appointment_history']});
        },
        onError: (error) => {
            console.error("Error deleting appointment", error);
        }
    }
    )
    return { mutate };
}

