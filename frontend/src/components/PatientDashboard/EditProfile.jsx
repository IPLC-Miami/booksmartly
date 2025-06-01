import { Pencil2Icon } from "@radix-ui/react-icons";
import {
  Button,
  Dialog,
  DropdownMenu,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useMutation } from "@tanstack/react-query";
import { stringify } from "postcss";
import { useState } from "react";
import { useEffect } from "react";
import useHandleEditProfile from "../../hooks/useHandleEditProfile";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function EditProfile({ id, profile, setProfile, fetchUserProfile }) {
  //   const editedProfile = profile;
  // console.log("in edit profile", id);
  const navigate = useNavigate();
  // // console.log(profile);
  const [editedProfile, setEditedProfile] = useState(profile);
  const { mutate, onSuccess, onError } = useHandleEditProfile();

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  // // console.log("edited profile", editedProfile);
  const { name, address, email, profileImage, age, gender } = editedProfile;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const tokenString = localStorage.getItem(
    "sb-itbxttkivivyeqnduxjb-auth-token",
  );
  const token = JSON?.parse(tokenString);
  useEffect(() => {
    // // console.log("ggggg", token);
    if (!token) {
      toast.error("Session Expired Please Login Again.");
      navigate("/login", { state: { sessionExpiration: true } }); // Redirect to login page
    }
  }, [token]);

  const accessToken = token?.access_token;

  function onSave() {
    const user_id = String(id);
    profile.userId = user_id;
    const updateUser = async (userId, accessToken, editedProfile) => {
      // console.log(editedProfile);
      mutate.mutate(
        { userId, accessToken, editedProfile },
        {
          onSuccess: (data) => {
            // console.log("Updated user info successfully :", data);
          },
          onError: (error) => {
            console.error(
              "Error updating user:",
              error.response?.data || error.message,
            );
          },
        },
      );
    };
    // // console.log("Sending user data:", signUpData2);
    updateUser(user_id, accessToken, editedProfile);
    updateUser(id, editedProfile);
    setProfile(editedProfile);
  }

  function onSave() {
    const user_id = String(id);
    profile.userId = user_id;
    mutate.mutate(
      { userId: user_id, accessToken, editedProfile },
      {
        onSuccess: (data) => {
          // console.log("Updated user info successfully:", data);
        },
        onError: (error) => {
          console.error(
            "Error updating user:",
            error.response?.data || error.message,
          );
        },
      },
    );
    setProfile(editedProfile);
  }

  function onCancel() {
    // Reset the edited profile
    setEditedProfile(profile);
  }

  return (
    <div>
      <Dialog.Root>
        <Dialog.Trigger>
          <Button size={"1"}>
            Edit <Pencil2Icon width={15} height={15} />{" "}
          </Button>
        </Dialog.Trigger>

        <Dialog.Content maxWidth="450px">
          <Dialog.Title>Edit your profile details</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Make changes to your profile.
          </Dialog.Description>

          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Name
              </Text>
              <TextField.Root
                value={editedProfile.name}
                placeholder="Enter your full name"
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, name: e.target.value })
                }
              />
            </label>
            {/* <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Email
              </Text>
              <TextField.Root
                value={email}
                placeholder="Enter your email"
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, email: e.target.value })
                }
              />
            </label> */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Address
              </Text>
              <TextField.Root
                value={address}
                placeholder="Enter your address"
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    address: e.target.value,
                  })
                }
              />
            </label>
            <div className="flex gap-x-4">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Age
                </Text>
                <TextField.Root
                  value={age}
                  placeholder="Enter your age"
                  type="number"
                  pattern="[0-9]*"
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      age: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Gender
                </Text>
                <DropdownMenu.Root modal={false}>
                  <DropdownMenu.Trigger>
                    <Button variant="outline" color="gray">
                      {/* Gender */}
                      {gender ? gender : "Gender"}
                      <DropdownMenu.TriggerIcon />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item
                      onClick={() =>
                        setEditedProfile({ ...editedProfile, gender: "Male" })
                      }
                    >
                      Male
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={() =>
                        setEditedProfile({ ...editedProfile, gender: "Female" })
                      }
                    >
                      Female
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </label>
            </div>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray" onClick={() => onCancel()}>
                Cancel
              </Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button
                onClick={() => {
                  onSave();
                }}
              >
                Save
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

export default EditProfile;
