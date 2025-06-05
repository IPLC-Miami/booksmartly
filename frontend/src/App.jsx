import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./ui/AppLayout";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import BookAppointment from "./pages/BookAppointment";
import AccountVerification from "./pages/AccountVerification";
import AccountVerified from "./pages/AccountVerified";
import Dashboard from "./pages/Dashboard";
import ClinicianDashboardPage from "./pages/ClinicianDashboardPage";
import ReceptionDashboardPage from "./pages/ReceptionDashboardPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import BillingPage from "./pages/BillingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordEmailSent from "./pages/ResetPasswordEmailSent";
import ResetPassword from "./pages/ResetPassword";
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
          path: "/signup",
          element: <SignUpPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/login",
          element: <LoginPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/verification",
          element: <AccountVerification />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/verified",
          element: <AccountVerified />,
          errorElement: <ErrorPage />,
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
        {
          path: "/user/resetPassword",
          element: <ForgotPassword />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/user/resetPasswordEmailSent",
          element: <ResetPasswordEmailSent />,
          errorElement: <ErrorPage />,
        },
        {
          path: "user/resetPassEnterEmail",
          element: <ResetPassword />,
          errorElement: <ErrorPage />,
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
