import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user data exists in localStorage
    const userId = localStorage.getItem("userId");
    
    if (!userId) {
      // If no user data, redirect to login
      navigate("/login");
    } else {
      // User data exists, show dashboard
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div>
      <h1>Welcome to your Dashboard!</h1>
      {/* Render dashboard content */}
      <button onClick={handleLogout}>Logout</button>
      {/* Render dashboard content */}
    </div>
  );
};

export default DashboardPage;

