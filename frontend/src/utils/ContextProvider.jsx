import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const BookSmartlyContext = createContext();
const AuthContext = createContext();

export function useBookSmartlyContext() {
  const context = useContext(BookSmartlyContext);
  if (!context) {
    throw new Error("useBookSmartlyContext must be used within a BookSmartlyProvider");
  }
  return context;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider",
    );
  }
  return context;
}

export default function BookSmartlyProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme) {
      setTheme(theme);
    }
  }, []);

  return (
    <BookSmartlyContext.Provider
      value={{
        theme,
        setTheme,
        profile,
        setProfile,
      }}
    >
      {children}
    </BookSmartlyContext.Provider>
  );
}
export function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Optionally, listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user || null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
