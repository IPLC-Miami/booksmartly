import { useMutation , useQueryClient } from "@tanstack/react-query";
import { postPrescription } from "../utils/api";
import { set } from "lodash";
import {toast} from "sonner";
export default function usePostPrescription(setSavePrescriptionSuccess) {
    const queryClient = useQueryClient();
    const mutate = useMutation({
        mutationFn: postPrescription,
        onSuccess: (data) => {
            setSavePrescriptionSuccess(true);
            // console.log("Prescription updated successfully");
            // toast.success("Prescription added successfully");
            queryClient.invalidateQueries({ queryKey: ['prescription'] });
        },
        onError: (error) => {
            // console.log("Error updating prescription", error);
        }
    }
    )
    return { mutate };
}

