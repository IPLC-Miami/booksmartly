import { Pencil2Icon } from "@radix-ui/react-icons";
import {
  Button,
  Dialog,
  DropdownMenu,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useState } from "react";

function EditClinicianProfile({ profile, setProfile }) {
  //   const editedProfile = profile;
  const [editedProfile, setEditedProfile] = useState(profile);
  const { name, address, email, profileImage, age, gender } = editedProfile;

  function onSave() {
    // Save the edited profile
    // save the edited profile to the database
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
                value={name}
                placeholder="Enter your full name"
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, name: e.target.value })
                }
              />
            </label>
            <label>
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
            </label>
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
                  placeholder="Enter your address"
                  type="number"
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
                  Age
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
              <Button onClick={() => onSave()}>Save</Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

export default EditClinicianProfile;