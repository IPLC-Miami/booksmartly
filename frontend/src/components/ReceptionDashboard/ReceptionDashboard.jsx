import { Box, Separator, Tabs } from "@radix-ui/themes";
import ReceptionProfileTab from "./ReceptionProfileTab";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MultiDoctorDashboard from "../../pages/MultiDoctorDashboard";

function ReceptionDashboard() {
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
            value="Queues"
            onClick={() => setSearchParams({ tab: "Queues" })}
          >
            Queues
          </Tabs.Trigger>
        </Tabs.List>

        <Box pt="3">
          <Tabs.Content value="profile">
            <ReceptionProfileTab />
          </Tabs.Content>
        </Box>
        {/* </Tabs.Root> */}
        <Box pt="3">
          <Tabs.Content value="Queues">
            <MultiDoctorDashboard />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}

export default ReceptionDashboard;
