import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfilePicture } from "../utils/api";

export default function useUpdateUserProfilePicture() {
  const queryClient = useQueryClient();

  const mutate = useMutation({
    // The mutationFn now accepts an object with userId, accessToken, and editedProfile
    mutationFn: ({ userId, accessToken, formData }) => {
      // console.log("in frontend2", formData);
      return updateUserProfilePicture(userId, accessToken, formData);
    },

    // Here, 'variables' contains the object passed to mutate.mutate()
    onSuccess: (data, variables) => {
      // console.log("User profile pic uploaded sucessfully");
      queryClient.invalidateQueries({
        queryKey: ["userDetails", variables.userId],
      });
    },
    onError: (error) => {
      // console.log("Error uploading profile picture", error);
    },
  });

  return { mutate };
}

