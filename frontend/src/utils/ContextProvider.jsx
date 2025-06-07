import { createContext, useContext, useEffect, useState } from "react";
// AUTHENTICATION DISABLED - No supabaseClient import needed

const BookSmartlyContext = createContext();
// AUTHENTICATION DISABLED - AuthContext removed

export function useBookSmartlyContext() {
  const context = useContext(BookSmartlyContext);
  if (!context) {
    throw new Error("useBookSmartlyContext must be used within a BookSmartlyProvider");
  }
  return context;
}

// AUTHENTICATION DISABLED - useAuthContext removed

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
// AUTHENTICATION DISABLED - AuthContextProvider removed

