import { useQueryClient , useMutation } from "@tanstack/react-query";
import { postAppointmentStatus } from "../utils/api";
import {toast} from "sonner";
export default function usePostAppointmentStatus(setUpdateAppointmentStatusSuccess) {
    const queryClient = useQueryClient();
    const mutate = useMutation({
        mutationFn: postAppointmentStatus,
        onSuccess: (data) => {
            setUpdateAppointmentStatusSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['patient_appointment_history'] });
            queryClient.invalidateQueries({ queryKey: ['doctor_queue_history'] });
            queryClient.invalidateQueries({ queryKey: ['doctor_queue'] });
        },
        onError: (error) => {
            console.error("Error updating appointment status", error);
        }
    }
    )
    return { mutate };
}

