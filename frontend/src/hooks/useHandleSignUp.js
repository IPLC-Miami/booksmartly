//use mutations
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAppointment, signUpNewUser } from "../utils/api";
export default function useHandleSignUp(signUpData) {
  //   const queryClient = useQueryClient(signUpData);
  const mutate = useMutation({
    mutationFn: (data) => {
      return signUpNewUser(data);
    },

    onSuccess: (data) => {
      if (data.success === false) {
        throw new Error(data.message || "Sign-up failed"); // Force `onError`
      }
    },
    onError: (error) => {
      console.error("Error signing up", error);
    },
  });
  return { mutate };
}

