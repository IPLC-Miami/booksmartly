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
      // console.log("User edited profile successfully");
      queryClient.invalidateQueries({
        queryKey: ["userDetails", variables.userId],
      });
    },
    onError: (error) => {
      // console.log("Error editing profile", error);
    },
  });

  return { mutate };
}

