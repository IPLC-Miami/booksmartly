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
import ProtectedRoutes from "./utils/ProtectedRoutes";
import EnhancedProtectedRoute from "./utils/EnhancedProtectedRoute";
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
        // {
        //   path: "/bookappointment",
        //   element: <BookAppointment />,
        //   // path: "/user/dashboard",
        //   // element: <UserDashboard />,
        //   errorElement: <ErrorPage />,
        // },
        // Protected routes with role-based access control
        {
          element: <EnhancedProtectedRoute />,
          children: [
            // General dashboard - accessible to all authenticated users
            {
              path: "/user/dashboard",
              element: <Dashboard />,
              errorElement: <ErrorPage />,
            },
          ],
        },
        // Client-only routes
        {
          element: <EnhancedProtectedRoute allowedRoles={["PATIENT"]} />,
          children: [
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
          ],
        },
        // Clinician-only routes
        {
          element: <EnhancedProtectedRoute allowedRoles={["clinician"]} />,
          children: [
            {
              path: "/clinician-dashboard",
              element: <ClinicianDashboardPage />,
              errorElement: <ErrorPage />,
            },
          ],
        },
        // Reception-only routes
        {
          element: <EnhancedProtectedRoute allowedRoles={["RECEPTION"]} />,
          children: [
            {
              path: "/reception-dashboard",
              element: <ReceptionDashboardPage />,
              errorElement: <ErrorPage />,
            },
          ],
        },
        // Clinician and Reception access routes (billing, analytics, chat)
        {
          element: <EnhancedProtectedRoute allowedRoles={["clinician", "RECEPTION"]} />,
          children: [
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
          ],
        },
        // Profile route - accessible to all authenticated users
        {
          element: <EnhancedProtectedRoute />,
          children: [
            {
              path: "/profile",
              element: <ProfilePage />,
              errorElement: <ErrorPage />,
            },
          ],
        },
        // {
        //   path: "/user/dashboard",
        //   element: <UserDashboard />,
        //   errorElement: <ErrorPage />,
        // },
        // {
        //   path: "/user/dashboard",
        //   element: <UserDashboard />,
        //   errorElement: <ErrorPage />,
        // },
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
  // Removed basename to work at root domain
  // {
  //   basename: "/BookSmartly",
  // },
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

