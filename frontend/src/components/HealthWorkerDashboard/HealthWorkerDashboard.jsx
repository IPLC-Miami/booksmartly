import { Box, Separator, Tabs } from "@radix-ui/themes";
import HealthWorkerProfileTab from "./HealthWorkerProfileTab";
import PatientHealthStatusForm from "./PatientHealthCheckupform";
import HealthCampRegistrationForm from "./HealthCampRegistration";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

function HealthWorkerDashboard() {
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
            value="Health Checkup Form"
            onClick={() => setSearchParams({ tab: "Health Checkup Form" })}
          >
            Health Checkup Form
          </Tabs.Trigger>
          <Tabs.Trigger
            value="Health Camp Registration"
            onClick={() => setSearchParams({ tab: "Health Camp Registration" })}
          >
            Health Camp Registration
          </Tabs.Trigger>
        </Tabs.List>
        <Box pt="3">
          <Tabs.Content value="profile">
            <HealthWorkerProfileTab />
          </Tabs.Content>

          <Tabs.Content value="Health Checkup Form">
            <PatientHealthStatusForm />
          </Tabs.Content>

          <Tabs.Content value="Health Camp Registration">
            <HealthCampRegistrationForm />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </div>
  );
}

export default HealthWorkerDashboard;

