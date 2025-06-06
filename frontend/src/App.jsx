import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AppLayout from "./ui/AppLayout";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import UserSelection from "./pages/UserSelection";
import BookAppointment from "./pages/BookAppointment";
import Dashboard from "./pages/Dashboard";
import ClinicianDashboardPage from "./pages/ClinicianDashboardPage";
import ReceptionDashboardPage from "./pages/ReceptionDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import BillingPage from "./pages/BillingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import { ToastContainer } from "react-toastify";
// Removed ProtectedRoutes and EnhancedProtectedRoute imports - NO AUTH
import SingleFeaturePageChatbot from "./pages/SingleFeaturePageChatbot";
import SingleFeaturePageMedSpecRec from "./pages/SingleFeaturePageMedSpecRec";
import SingleFeaturePageFeedback from "./pages/SingleFeaturePageFeedback";
import HealthCamps from "./pages/HealthCamps";
import LabResultSummary from "./components/PatientDashboard/LabResultSummary";
import AIConsultation from "./pages/AIConsultation";

const router = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Home />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/login",
          element: <UserSelection />,
          errorElement: <ErrorPage />,
        },
        // Redirect old auth routes to user selection
        {
          path: "/signup",
          element: <Navigate to="/login" replace />,
        },
        {
          path: "/verification",
          element: <Navigate to="/login" replace />,
        },
        {
          path: "/verified",
          element: <Navigate to="/login" replace />,
        },
        // ALL ROUTES NOW PUBLIC - NO AUTH REQUIRED
        {
          path: "/user/dashboard",
          element: <Dashboard />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/bookappointment",
          element: <BookAppointment />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/client-dashboard",
          element: <ClientDashboardPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/clinician-dashboard",
          element: <ClinicianDashboardPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/reception-dashboard",
          element: <ReceptionDashboardPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/billing",
          element: <BillingPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/analytics",
          element: <AnalyticsPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/chat",
          element: <ChatPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/profile",
          element: <ProfilePage />,
          errorElement: <ErrorPage />,
        },
        // Redirect password reset routes to user selection
        {
          path: "/user/resetPassword",
          element: <Navigate to="/login" replace />,
        },
        {
          path: "/user/resetPasswordEmailSent",
          element: <Navigate to="/login" replace />,
        },
        {
          path: "user/resetPassEnterEmail",
          element: <Navigate to="/login" replace />,
        },
        {
          path: "/featureAIChatbot",
          element: <SingleFeaturePageChatbot />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/featureAIRecommendation",
          element: <SingleFeaturePageMedSpecRec />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/featureAIFeedback",
          element: <SingleFeaturePageFeedback />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/health-camps",
          element: <HealthCamps />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/labresults",
          element: <LabResultSummary />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/AIConsultation",
          element: <AIConsultation />,
          errorElement: <ErrorPage />,
        }
      ],
    },
  ],
  {
    basename: "/booksmartly"
  }
);

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <div data-lenis-prevent="true">
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
