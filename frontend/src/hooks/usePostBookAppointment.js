import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postBookAppointment } from "../utils/api";
import { toast } from "sonner";
export default function usePostBookAppointment(setBookingStatus) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: postBookAppointment,
        onSuccess: (data) => {
            toast.success("Appointment booked successfully.");
            queryClient.invalidateQueries({ queryKey: ['patient_appointments'] });
            queryClient.invalidateQueries({ queryKey: ['patient_appointment_history'] });
            queryClient.invalidateQueries({ queryKey: ['doctor_queue_history'] });
            queryClient.invalidateQueries({ queryKey: ['doctor_queue'] });
            setBookingStatus(true);
        },
        onError: (error) => {
            console.error("Error booking appointment", error);
        }
    }
    )
    return mutation;
}

