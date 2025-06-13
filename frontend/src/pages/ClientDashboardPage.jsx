import PatientDashboard from "../components/PatientDashboard/PatientDashboard";
import { useAuthContext } from "../utils/ContextProvider";

function ClientDashboardPage() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mb-24 mt-12 flex flex-col overflow-hidden p-4 font-noto md:px-12 md:py-8">
      <PatientDashboard userId={user?.id} />
    </div>
  );
}

export default ClientDashboardPage;