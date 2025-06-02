import PatientDashboard from "../components/PatientDashboard/PatientDashboard";

function ClientDashboardPage() {
  return (
    <div className="mb-24 mt-12 flex flex-col overflow-hidden p-4 font-noto md:px-12 md:py-8">
      <PatientDashboard />
    </div>
  );
}

export default ClientDashboardPage;