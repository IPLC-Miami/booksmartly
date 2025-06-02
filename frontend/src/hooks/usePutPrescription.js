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
            queryClient.invalidateQueries({ queryKey: ['prescription'] });
        },
        onError: (error) => {
            console.error("Error updating prescription", error);
        }
    }
    )
    return { mutate };
}

