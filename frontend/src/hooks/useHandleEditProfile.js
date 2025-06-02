import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserDetailsById } from "../utils/api";

export default function useHandleEditProfile() {
  const queryClient = useQueryClient();

  const mutate = useMutation({
    // The mutationFn now accepts an object with userId, accessToken, and editedProfile
    mutationFn: ({ userId, accessToken, editedProfile }) => {
      return updateUserDetailsById(userId, accessToken, editedProfile);
    },

    // Here, 'variables' contains the object passed to mutate.mutate()
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userDetails", variables.userId],
      });
    },
    onError: (error) => {
      console.error("Error editing profile", error);
    },
  });

  return { mutate };
}

