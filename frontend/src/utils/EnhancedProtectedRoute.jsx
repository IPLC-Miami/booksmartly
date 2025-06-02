import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useUserRoleById from "../hooks/useUserRoleById";
import { useGetCurrentUser } from "../hooks/useGetCurrentUser";
import { toast } from "sonner";

/**
 * Enhanced Protected Route Component with Role-Based Access Control
 * 
 * @param {Array} allowedRoles - Array of roles that can access this route
 * @param {string} redirectTo - Path to redirect unauthorized users (default: "/login")
 * @param {React.ReactNode} children - Child components to render if authorized
 */
function EnhancedProtectedRoute({ allowedRoles = [], redirectTo = "/login", children }) {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const tokenString = localStorage.getItem("sb-itbxttkivivyeqnduxjb-auth-token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  const accessToken = token?.access_token;

  // Hooks for fetching user data and role
  const { data: dataUser, isLoading: userLoading, error: userError } = useGetCurrentUser();
  const { data: dataRole, isLoading: roleLoading, error: roleError } = useUserRoleById(userId, accessToken);

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
  }, [token]);

  // Set userId when user data is available
  useEffect(() => {
    if (token && dataUser) {
      setUserId(dataUser?.user?.id);
    }
  }, [dataUser, token]);

  // Set role when role data is available
  useEffect(() => {
    if (dataRole?.data && dataRole.data.length > 0) {
      const userRole = dataRole.data[0].role;
      setRole(userRole);
      setIsLoading(false);
    } else if (dataRole && (!dataRole.data || dataRole.data.length === 0)) {
      setError("No role assigned to this user");
      setIsLoading(false);
    }
  }, [dataRole]);

  // Handle loading states and errors
  useEffect(() => {
    if (!userLoading && !roleLoading && userId && !role && !error) {
      if (roleError) {
        setError("Failed to fetch user role");
        toast.error("Failed to fetch user role");
      } else if (userError) {
        setError("Failed to fetch user data");
        toast.error("Failed to fetch user data");
      }
      setIsLoading(false);
    }
  }, [userLoading, roleLoading, userId, role, error, roleError, userError]);

  // No token - redirect to login
  if (!token) {
    toast.error("Session expired. Please login again.");
    return <Navigate to={redirectTo} replace />;
  }

  // Show loading state
  if (isLoading || userLoading || (userId && roleLoading)) {
    return (
      <div className="mb-24 mt-12 flex flex-col items-center justify-center p-4 font-noto md:px-12 md:py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg">Verifying access...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="mb-24 mt-12 flex flex-col items-center justify-center p-4 font-noto md:px-12 md:py-8">
        <div className="text-lg text-red-600 mb-4">Access Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check role-based access
  if (allowedRoles.length > 0 && role) {
    const hasAccess = allowedRoles.includes(role);
    
    if (!hasAccess) {
      toast.error("You don't have permission to access this page");
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  // User is authenticated and authorized
  return children ? children : <Outlet />;
}

export default EnhancedProtectedRoute;