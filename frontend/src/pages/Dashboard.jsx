import ClinicianDashboard from "../components/ClinicianDashboard/ClinicianDashboard";
import PatientDashboard from "../components/PatientDashboard/PatientDashboard";
import ReceptionDashboard from "../components/ReceptionDashboard/ReceptionDashboard";
import MultiClinicianDashboard from "./MultiClinicianDashboard";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import useUserRoleById from "../hooks/useUserRoleById";
import { useGetCurrentUser } from "../hooks/useGetCurrentUser";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import HealthWorkerDashboard from "../components/HealthWorkerDashboard/HealthWorkerDashboard";

function Dashboard() {
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  // var accessToken = null;

  // useEffect(() => {
  // if (token) {
  const tokenString = localStorage.getItem(
    "sb-vakmfwtcbdeaigysjgch-auth-token",
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
  // console.log(accessToken);
  const {
    isLoading: isLoadingRole,
    data: dataRole,
    error: errorRole,
    refetch: refetchRole,
    isFetching: isFetchingRole,
  } = useUserRoleById(userId, accessToken);

  const {
    isLoading: isLoadingUser,
    data: dataUser,
    error: errorUser,
    refetch: refetchUser,
    isFetching: isFetchingUser,
  } = useGetCurrentUser();
  // const { mutate, onSuccess, onError } = useGetCurrentUser();

  useEffect(() => {
    if (token && dataUser) {
      // console.log(dataUser);
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
  }, [userId, dataRole]);

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
