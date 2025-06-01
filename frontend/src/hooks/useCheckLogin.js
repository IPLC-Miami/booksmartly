import { useMutation } from "@tanstack/react-query";
import { logIn } from "../utils/api";

export function useCheckLogin() {
  // const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: logIn,
    onSuccess: (data) => {
      // console.log("logged in successfully");
    },
    onError: (error) => {
      // console.log("Error logging in", error);
    },
  });
  return { mutate };
}

