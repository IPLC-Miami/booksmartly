import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfilePicture } from "../utils/api";

export default function useUpdateUserProfilePicture() {
  const queryClient = useQueryClient();

  const mutate = useMutation({
    // The mutationFn now accepts an object with userId and formData
    mutationFn: ({ userId, formData }) => {
      return updateUserProfilePicture(userId, formData);
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

