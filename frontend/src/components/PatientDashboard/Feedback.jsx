import { Button, Dialog, Flex, Spinner, TextArea } from "@radix-ui/themes";
import { useState } from "react";
import { toast } from "sonner";
import { postFeedback } from "../../utils/api";
function Feedback({ data }) {
  // console.log("in FeedBack data: " , data)
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);
  async function sendFeedback() {
    // await for 2s
    setLoading(true);
    try{
    const id=data.appointmentId
    const id2 = data.clinicianId
    const response = await postFeedback(id, feedbackText, id2);
    // if (response.status !== 200) {
    //   toast.error("Error sending feedback");
    //   setLoading(false);
    //   return;
    // }
    toast.success("Feedback sent successfully");
    setLoading(false);
    setFeedbackText("");
  }
  catch(error){
    // console.log("Error sending feedback", error);
    toast.error("Error sending feedback");
    setLoading(false);
  }
  }

  return (
    <div className="font-noto">
      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="" color="blue">
            Feedback
          </Button>
        </Dialog.Trigger>

        <Dialog.Content maxWidth="450px">
          <div className="mb-2 text-sm font-medium">
            Please enter your feedback for the appointment:
          </div>
          <TextArea
            resize="vertical"
            style={{
              minHeight: 150,
            }}
            data-lenis-prevent="true"
            placeholder="Feedback..."
            onChange={(e) => setFeedbackText(e.target.value)}
            value={feedbackText}
          />

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button color="red">Cancel</Button>
            </Dialog.Close>
            <Button
              onClick={() => sendFeedback()}
              disabled={feedbackText.length === 0 || loading}
            >
              Send {loading && <Spinner />}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

export default Feedback;

