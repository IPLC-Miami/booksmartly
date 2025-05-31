import { Theme } from "@radix-ui/themes";
import ReactLenis from "lenis/react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import ChatBot from "../components/ChatBot/ChatBot";

function AppLayout() {
  return (
    <ReactLenis root options={{ lerp: 0.15 }}>
      <Theme appearance={"light"}>
        <div className="">
          <Header />
          <main className="layout relative flex flex-col font-inter">
            <Outlet />
          </main>
          <div className="pointer-events-none fixed bottom-0 left-0 w-full">
            <ChatBot />
          </div>
        </div>
      </Theme>
    </ReactLenis>
  );
}

export default AppLayout;
