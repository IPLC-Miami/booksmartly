import { Box, Tabs } from "@radix-ui/themes";
import ProfileTab from "./ProfileTab";
import UpcomingAppointments from "./UpcomingAppointments";
import HistoryAppointments from "./HistoryAppointments";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

function PatientDashboard({ userId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "profile");

  useEffect(() => {
    setTab(searchParams.get("tab") || "profile");
  }, [searchParams]);

  return (
    <div className="text-sm font-medium">
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

