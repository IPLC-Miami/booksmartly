// src/components/Logout.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { toast } from "sonner";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        // console.log("User signed out successfully");
        toast.success("Signed Out Successfully");
        navigate("/login", { state: { loggedOut: true } }); // Redirect to login page
      }
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

