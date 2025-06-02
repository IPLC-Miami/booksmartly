import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfilePicture } from "../utils/api";

export default function useUpdateUserProfilePicture() {
  const queryClient = useQueryClient();

  const mutate = useMutation({
    // The mutationFn now accepts an object with userId, accessToken, and editedProfile
    mutationFn: ({ userId, accessToken, formData }) => {
      return updateUserProfilePicture(userId, accessToken, formData);
    },

    // Here, 'variables' contains the object passed to mutate.mutate()
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userDetails", variables.userId],
      });
    },
    onError: (error) => {
      console.error("Error uploading profile picture", error);
    },
  });

  return { mutate };
}

