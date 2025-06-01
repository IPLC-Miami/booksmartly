import ClinicianDashboard from "../components/ClinicianDashboard/ClinicianDashboard";
import PatientDashboard from "../components/PatientDashboard/PatientDashboard";
import ReceptionDashboard from "../components/ReceptionDashboard/ReceptionDashboard";
import { useState, useEffect } from "react";
import useUserRoleById from "../hooks/useUserRoleById";
import { useGetCurrentUser } from "../hooks/useGetCurrentUser";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import HealthWorkerDashboard from "../components/HealthWorkerDashboard/HealthWorkerDashboard";

function Dashboard() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const tokenString = localStorage.getItem(
    "sb-itbxttkivivyeqnduxjb-auth-token",
  );

  const token = JSON?.parse(tokenString);
  useEffect(() => {
    if (!token) {
      toast.error("Session Expired Please Login Again.");
      navigate("/login", { state: { sessionExpired: true } });
    }
  }, [token, navigate]);
  
  const accessToken = token?.access_token;
  
  const { data: dataRole } = useUserRoleById(userId, accessToken);
  const { data: dataUser } = useGetCurrentUser();

  useEffect(() => {
    if (token && dataUser) {
      setUserId(dataUser?.user?.id);
    }
  }, [dataUser, token]);

  useEffect(() => {
    if (dataRole?.data && dataRole.data.length > 0) {
      setRole(dataRole.data[0].role);
      if (role === "PATIENT") {
      } else if (role === "clinician") {
        toast.success("Welcome Clinician");
      }
    }
  }, [userId, dataRole, role]);

  return (
    <div className="mb-24 mt-12 flex flex-col overflow-hidden p-4 font-noto md:px-12 md:py-8">
      {role &&
        (role === "PATIENT" ? (
          <PatientDashboard />
        ) : role === "RECEPTION" ? (
          <ReceptionDashboard />
        ) : role === "HEALTH WORKER" ? (
          <HealthWorkerDashboard />
        ) : (
          // <MultiClinicianDashboard />
          <ClinicianDashboard />
        ))}
    </div>
  );
}

export default Dashboard;
