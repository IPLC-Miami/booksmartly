import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../utils/ContextProvider";
import { getRoleBasedRedirect } from "../utils/authHelper";

function Dashboard() {
  const navigate = useNavigate();
  const { userRole, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && userRole) {
      // Redirect to the appropriate role-specific dashboard
      const redirectPath = getRoleBasedRedirect(userRole);
      console.log("Redirecting to role-specific dashboard:", redirectPath, "for role:", userRole);
      navigate(redirectPath, { replace: true });
    }
  }, [userRole, loading, navigate]);

  // Show loading state while determining role
  if (loading) {
    return (
      <div className="mb-24 mt-12 flex flex-col items-center justify-center p-4 font-noto md:px-12 md:py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  // Show error state if no role is determined
  if (!userRole) {
    return (
      <div className="mb-24 mt-12 flex flex-col items-center justify-center p-4 font-noto md:px-12 md:py-8">
        <div className="text-lg text-red-600">Error: No role assigned to this user</div>
        <div className="text-sm text-gray-600 mt-2">Please contact support</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // This should not be reached due to the redirect above
  return (
    <div className="mb-24 mt-12 flex flex-col items-center justify-center p-4 font-noto md:px-12 md:py-8">
      <div className="text-lg">Redirecting to dashboard...</div>
    </div>
  );
}

export default Dashboard;

