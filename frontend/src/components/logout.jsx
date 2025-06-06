// src/components/Logout.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Logout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      
      // Clear any cached queries
      queryClient.clear();
      
      toast.success("Signed Out Successfully");
      navigate("/login", { state: { loggedOut: true } }); // Redirect to login page
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
    >
      Logout
    </button>
  );
};

export default Logout;

