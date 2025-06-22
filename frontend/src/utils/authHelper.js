
import { jwtDecode } from "jwt-decode";

export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const decoded = jwtDecode(token);
  return decoded;
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

export const getCurrentUserWithRole = () => {
  const user = getCurrentUser();
  const role = getUserRole();
  return { user, role };
};

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const signInWithEmail = async (email, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("token", data.token);
  }
  return data;
};

export const signUpWithEmail = async (email, password, options = {}) => {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, ...options }),
  });
  return await response.json();
};

export const signOut = () => {
  localStorage.removeItem("token");
};

export const resetPassword = async (email) => {
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await response.json();
};

export const updatePassword = async (newPassword) => {
  const response = await fetch("/api/auth/update-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ newPassword }),
  });
  return await response.json();
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const refreshSession = async () => {
  const response = await fetch("/api/auth/refresh-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("token", data.token);
  }
  return data;
};

// Check if user has specific role
export const hasRole = async (requiredRole) => {
  try {
    const { user, role } = await getCurrentUserWithRole()
    
    if (!user || !role) return false
    
    return role === requiredRole
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

// Check if user is admin
export const isAdmin = async () => {
  return await hasRole('admin')
}

// Check if user is clinician
export const isClinician = async () => {
  return await hasRole('clinician')
}

// Check if user is client
export const isClient = async () => {
  return await hasRole('client')
}

// Check if user is reception
export const isReception = async () => {
  return await hasRole('reception')
}

// Check if user is staff (admin, reception, or clinician)
export const isStaff = async () => {
  try {
    const { user, role } = await getCurrentUserWithRole()
    
    if (!user || !role) return false
    
    return role === 'admin' || role === 'reception' || role === 'clinician'
  } catch (error) {
    console.error('Error checking if user is staff:', error)
    return false
  }
}

// Get redirect path based on user role
export const getRoleBasedRedirect = (role) => {
  const redirectPaths = {
    admin: '/reception-dashboard',
    reception: '/reception-dashboard',
    clinician: '/clinician-dashboard',
    client: '/client-dashboard'
  }
  
  return redirectPaths[role] || '/client-dashboard'
}

export default {
  getCurrentUser,
  getUserRole,
  getCurrentUserWithRole,
  isAuthenticated,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
  updatePassword,
  getAuthToken,
  refreshSession,
  hasRole,
  isAdmin,
  isClinician,
  isClient,
  isReception,
  isStaff,
  getRoleBasedRedirect
}