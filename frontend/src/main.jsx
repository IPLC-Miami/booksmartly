import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "@radix-ui/themes/styles.css";

/* ------------------------ fonts ----------------------- */
import "@fontsource/inter/100.css";
import "@fontsource/inter/200.css";
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import "@fontsource-variable/noto-sans-mono";
import BookSmartlyProvider from "./utils/ContextProvider.jsx";
import { AuthContextProvider } from "./utils/ContextProvider.jsx";
import { Toaster } from "sonner";
/* ------------------------------------------------------ */

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <>
    <Toaster richColors closeButton />
    <BookSmartlyProvider>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </BookSmartlyProvider>
  </>,
  // </React.StrictMode>,
);

