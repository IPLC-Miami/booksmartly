import { useQueryClient , useMutation } from "@tanstack/react-query";
import { postAppointmentStatus } from "../utils/api";
import {toast} from "sonner";
export default function usePostAppointmentStatus(setUpdateAppointmentStatusSuccess) {
    const queryClient = useQueryClient();
    const mutate = useMutation({
        mutationFn: postAppointmentStatus,
        onSuccess: (data) => {
            setUpdateAppointmentStatusSuccess(true);
            // console.log("Appointment status updated successfully");
            // toast.success("Details saved successfully");
            queryClient.invalidateQueries({ queryKey: ['patient_appointment_history'] });
            queryClient.invalidateQueries({ queryKey: ['doctor_queue_history'] });
            queryClient.invalidateQueries({ queryKey: ['doctor_queue'] });
        },
        onError: (error) => {
            // console.log("Error updating appointment status", error);
            // toast.error("Error saving details");
        }
    }
    )
    return { mutate };
}

