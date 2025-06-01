import { Button, Code, DataList, Dialog, Flex, Text } from "@radix-ui/themes";

function SkipAppointment({ skipAppointment }) {
  return (
    <div className="font-noto">
      <Dialog.Root>
        <Dialog.Trigger>
          <Button size={{ initial: "1", md: "2" }} variant="soft" color="red">
            Skip
          </Button>
        </Dialog.Trigger>

        <Dialog.Content maxWidth="450px">
          <div className="font- mb-2 font-medium">Skip this appointment?</div>
          <Text className="flex justify-between gap-y-1 rounded-md text-sm font-normal">
            Are you sure that you want to skip this appointment?
          </Text>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button>No, Go Back</Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button color="red" onClick={skipAppointment}>
                Yes, Skip
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

export default SkipAppointment;
