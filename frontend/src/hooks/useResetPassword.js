//use mutations
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetPassword } from "../utils/api";
export function useResetPassword() {
  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: ({ token, password }) => {
      return resetPassword(token, password);
    },
    onSuccess: (data) => {
      // Password reset successful
    },
    onError: (error) => {
      console.error("Password reset failed", error);
    },
  });
  return { mutate };
}

