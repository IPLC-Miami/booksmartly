import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Logout from "../components/logout";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {

    const validateToken = async () => {

      const { data: session, error } = await supabase.auth.getSession();

      if (error || !session.session || session.session === null) {
        // If no session or error occurs, redirect to login
        setErrorMessage("Session expired. Please log in again.");
        // console.log("Session expired", session);
        navigate("/login"); // Redirect to login page
      } else {
        // Proceed with the dashboard page logic if the session is valid
        setLoading(false);
        // console.log("User is authenticated", session);
      }
    };

    validateToken();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome to your Dashboard!</h1>
      {/* Render dashboard content */}
      {/* Use the Logout component here */}
      <Logout />
      {/* Render dashboard content */}
    </div>
  );
};

export default DashboardPage;

