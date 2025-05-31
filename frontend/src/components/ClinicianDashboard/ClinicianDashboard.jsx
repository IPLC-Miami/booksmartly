import { Box, Separator, Tabs } from "@radix-ui/themes";
import ClinicianProfileTab from "./ClinicianProfileTab";
import ClinicianQueue from "./ClinicianQueue";
import ClinicianHistory from "./ClinicianHistory";
import HistoryAppointments from "../PatientDashboard/HistoryAppointments";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

function ClinicianDashboard() {
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
            value="profile"
            onClick={() => setSearchParams({ tab: "profile" })}
          >
            Profile
          </Tabs.Trigger>
          <Tabs.Trigger
            onClick={() => setSearchParams({ tab: "queue" })}
            value="queue"
          >
            Queue
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
            <ClinicianProfileTab />
          </Tabs.Content>

          <Tabs.Content value="queue">
            <ClinicianQueue />
          </Tabs.Content>

          <Tabs.Content value="history">
            <ClinicianHistory />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}

export default ClinicianDashboard;