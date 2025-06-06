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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Use proper Supabase session handling
  const { user: currentUser, session, loading: userLoading, error: userError } = useGetCurrentUser();
  
  // Get access token from Supabase session
  const accessToken = session?.access_token;
  
  const { data: dataRole, isLoading: roleLoading, error: roleError } = useUserRoleById(userId);

  // AUTH DISABLED - No session validation needed
  useEffect(() => {
    // Skip authentication check
  }, []);

  // Set userId when user data is available from Supabase session
  useEffect(() => {
    if (currentUser) {
      console.log("Setting userId from currentUser:", currentUser);
      setUserId(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    console.log("Role data received:", dataRole);
    console.log("User ID:", userId);
    console.log("Access Token:", accessToken ? "Present" : "Missing");
    
    if (dataRole?.data && dataRole.data.length > 0) {
      const userRole = dataRole.data[0].role;
      console.log("Setting role to:", userRole);
      setRole(userRole);
      setIsLoading(false);
      
      if (userRole === "PATIENT") {
        toast.success("Welcome Patient");
      } else if (userRole === "clinician") {
        toast.success("Welcome Clinician");
      } else if (userRole === "RECEPTION") {
        toast.success("Welcome Reception");
      } else if (userRole === "HEALTH WORKER") {
        toast.success("Welcome Health Worker");
      }
    } else if (dataRole && (!dataRole.data || dataRole.data.length === 0)) {
      console.error("No role data found for user");
      setError("No role assigned to this user");
      setIsLoading(false);
    }
  }, [userId, dataRole]);

  // Handle loading states
  useEffect(() => {
    if (!userLoading && !roleLoading && userId && !role && !error) {
      console.log("All data loaded but no role set - checking for errors");
      if (roleError) {
        console.error("Role fetch error:", roleError);
        setError("Failed to fetch user role");
      } else if (userError) {
        console.error("User fetch error:", userError);
        setError("Failed to fetch user data");
      }
      setIsLoading(false);
    }
  }, [userLoading, roleLoading, userId, role, error, roleError, userError]);

  // Show loading state
  if (userLoading || isLoading || (userId && roleLoading)) {
    return (
      <div className="mb-24 mt-12 flex flex-col items-center justify-center p-4 font-noto md:px-12 md:py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-24 mt-12 flex flex-col items-center justify-center p-4 font-noto md:px-12 md:py-8">
        <div className="text-lg text-red-600">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show role-based dashboard
  return (
    <div className="mb-24 mt-12 flex flex-col overflow-hidden p-4 font-noto md:px-12 md:py-8">
      {role ? (
        role === "PATIENT" ? (
          <PatientDashboard userId={userId} />
        ) : role === "RECEPTION" ? (
          <ReceptionDashboard userId={userId} />
        ) : role === "HEALTH WORKER" ? (
          <HealthWorkerDashboard userId={userId} />
        ) : (
          <ClinicianDashboard userId={userId} />
        )
      ) : (
        <div className="text-center">
          <div className="text-lg">No role assigned to this user</div>
          <div className="text-sm text-gray-600 mt-2">Please contact support</div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

