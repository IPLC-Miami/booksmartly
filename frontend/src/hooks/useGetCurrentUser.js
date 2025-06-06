import { useState, useEffect } from 'react';
import { getUserDetailsByID } from '../utils/api';

export function useGetCurrentUser() {
  // AUTH DISABLED - Fetch real user data using a default or stored user ID
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get user ID from localStorage or use a default
        // This allows testing different users by setting localStorage.setItem('currentUserId', 'some-user-id')
        const storedUserId = localStorage.getItem('currentUserId');
        
        if (!storedUserId) {
          // No user ID stored - fetch all users and use the first one as default
          const response = await fetch('/api/users/allusers');
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          
          const users = await response.json();
          if (users && users.length > 0) {
            // Use the first user as default
            const defaultUser = users[0];
            localStorage.setItem('currentUserId', defaultUser.id);
            
            // Fetch full user details - no token needed
            const userDetails = await getUserDetailsByID(defaultUser.id);
            
            setUser({
              id: userDetails.profile.id,
              name: userDetails.profile.name,
              email: userDetails.profile.email,
              phone: userDetails.profile.phone || userDetails.profile.phone_number,
              address: userDetails.profile.address,
              avatar_url: userDetails.profile.avatar_url,
              role: userDetails.profile.role || userDetails.profile.user_type,
              date_of_birth: userDetails.profile.date_of_birth,
              gender: userDetails.profile.gender,
              ...userDetails.profile
            });
            
            // Create session object for compatibility
            setSession({
              access_token: "auth-disabled-token",
              refresh_token: "auth-disabled-refresh",
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              token_type: "bearer",
              user: {
                id: userDetails.profile.id,
                email: userDetails.profile.email
              }
            });
          } else {
            throw new Error('No users found in database');
          }
        } else {
          // Fetch the specific user - no token needed
          const userDetails = await getUserDetailsByID(storedUserId);
          
          setUser({
            id: userDetails.profile.id,
            name: userDetails.profile.name,
            email: userDetails.profile.email,
            phone: userDetails.profile.phone || userDetails.profile.phone_number,
            address: userDetails.profile.address,
            avatar_url: userDetails.profile.avatar_url,
            role: userDetails.profile.role || userDetails.profile.user_type,
            date_of_birth: userDetails.profile.date_of_birth,
            gender: userDetails.profile.gender,
            ...userDetails.profile
          });
          
          // Create session object for compatibility
          setSession({
            access_token: "auth-disabled-token",
            refresh_token: "auth-disabled-refresh",
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: "bearer",
            user: {
              id: userDetails.profile.id,
              email: userDetails.profile.email
            }
          });
        }
        
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, session, loading, error };
}
