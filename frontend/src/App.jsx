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
import { ProtectedRoute, AdminRoute, ClinicianRoute, ClientRoute } from "./utils/ProtectedRoutes";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AccountVerification from "./pages/AccountVerification";
import AccountVerified from "./pages/AccountVerified";
import ResetPasswordEmailSent from "./pages/ResetPasswordEmailSent";
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
          element: <LoginPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/signup",
          element: <SignUpPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/forgot-password",
          element: <ForgotPassword />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/reset-password",
          element: <ResetPasswordPage />,
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
        {
          path: "/reset-password-email-sent",
          element: <ResetPasswordEmailSent />,
          errorElement: <ErrorPage />,
        },
        {
          path: "/user-selection",
          element: <UserSelection />,
          errorElement: <ErrorPage />,
        },
        // PROTECTED ROUTES - AUTH REQUIRED
        {
          path: "/user/dashboard",
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/dashboard",
          element: (
            <ClientRoute>
              <ClientDashboardPage />
            </ClientRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/bookappointment",
          element: (
            <ClientRoute>
              <BookAppointment />
            </ClientRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/book",
          element: (
            <ClientRoute>
              <BookAppointment />
            </ClientRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/client-dashboard",
          element: (
            <ClientRoute>
              <ClientDashboardPage />
            </ClientRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/clinician-dashboard",
          element: (
            <ClinicianRoute>
              <ClinicianDashboardPage />
            </ClinicianRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/reception-dashboard",
          element: (
            <AdminRoute>
              <ReceptionDashboardPage />
            </AdminRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/billing",
          element: (
            <AdminRoute>
              <BillingPage />
            </AdminRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/analytics",
          element: (
            <AdminRoute>
              <AnalyticsPage />
            </AdminRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/chat",
          element: (
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          ),
          errorElement: <ErrorPage />,
        },
        {
          path: "/profile",
          element: (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          ),
          errorElement: <ErrorPage />,
        },
        // Legacy route redirects
        {
          path: "/user/resetPassword",
          element: <Navigate to="/reset-password" replace />,
        },
        {
          path: "/user/resetPasswordEmailSent",
          element: <Navigate to="/reset-password-email-sent" replace />,
        },
        {
          path: "/user/resetPassEnterEmail",
          element: <Navigate to="/forgot-password" replace />,
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
    basename: import.meta.env.DEV ? '/booksmartly' : '/'
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
