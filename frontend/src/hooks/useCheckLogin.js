import { useMutation } from "@tanstack/react-query";
import { logIn } from "../utils/api";

export function useCheckLogin() {
  // const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: logIn,
    onSuccess: (data) => {
      // Success handled by calling component
    },
    onError: (error) => {
      console.error("Error logging in", error);
    },
  });
  return { mutate };
}

