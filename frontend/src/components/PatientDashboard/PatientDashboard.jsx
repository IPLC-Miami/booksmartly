import { Box, Tabs, Button } from "@radix-ui/themes";
import ProfileTab from "./ProfileTab";
import UpcomingAppointments from "./UpcomingAppointments";
import HistoryAppointments from "./HistoryAppointments";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PatientDashboard({ userId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "profile");
  const navigate = useNavigate();

  useEffect(() => {
    setTab(searchParams.get("tab") || "profile");
  }, [searchParams]);

  // Debug logging
  console.log('PatientDashboard rendered with userId:', userId);
  console.log('About to render Book Appointment button');

  return (
    <div className="text-sm font-medium">
      {/* Book Appointment Button - Always render regardless of userId */}
      <div className="mb-6 flex justify-center" style={{ backgroundColor: 'red', padding: '20px', border: '5px solid blue' }}>
        {console.log('Rendering Book Appointment button div')}
        <Button
          size="3"
          color="iris"
          onClick={() => {
            console.log('Book Appointment button clicked, navigating to /book');
            navigate("/book");
          }}
          className="font-semibold"
          data-testid="book-appointment-button"
          style={{ backgroundColor: 'yellow', color: 'black', fontSize: '20px', padding: '15px' }}
        >
          Book Appointment
        </Button>
      </div>
      
      <Tabs.Root value={tab}>
        <Tabs.List
          size={{
            initial: "1",
            sm: "2",
          }}
        >
          <Tabs.Trigger
            onClick={() => setSearchParams({ tab: "profile" })}
            value="profile"
          >
            Profile
          </Tabs.Trigger>
          <Tabs.Trigger
            onClick={() => setSearchParams({ tab: "appointments" })}
            value="appointments"
          >
            Appointments
          </Tabs.Trigger>
          <Tabs.Trigger
            onClick={() => setSearchParams({ tab: "history" })}
            value="history"
          >
            History
          </Tabs.Trigger>
        </Tabs.List>

        <Box pt="3">
          <Tabs.Content value="profile">
            <ProfileTab userId={userId} />
          </Tabs.Content>

          <Tabs.Content value="appointments">
            <UpcomingAppointments userId={userId} />
          </Tabs.Content>

          <Tabs.Content value="history">
            <HistoryAppointments userId={userId} />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}

export default PatientDashboard;

