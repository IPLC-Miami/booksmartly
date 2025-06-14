import ReceptionDashboard from "../components/ReceptionDashboard/ReceptionDashboard";
import { useAuthContext } from "../utils/ContextProvider";

function ReceptionDashboardPage() {
  const { user } = useAuthContext();

  return (
    <div className="mb-24 mt-12 flex flex-col overflow-hidden p-4 font-noto md:px-12 md:py-8">
      <ReceptionDashboard userId={user?.id} />
    </div>
  );
}

export default ReceptionDashboardPage;