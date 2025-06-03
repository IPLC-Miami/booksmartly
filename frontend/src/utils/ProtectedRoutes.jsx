import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useGetCurrentUser } from "../hooks/useGetCurrentUser";

const ProtectedRoutes = () => {
  const { user, loading, error } = useGetCurrentUser();

  if (loading) {
    return (
      <div className="mb-24 mt-12 flex flex-col items-center justify-center p-4 font-noto md:px-12 md:py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;

