import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const STORAGE_KEY = "sidebar_mini_v1";

const AppLayout: React.FC = () => {
  const [mini, setMini] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mini ? "1" : "0");
  }, [mini]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-background to-muted text-foreground">
      <div className="flex h-full">
        <Sidebar
          mini={mini}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main content area - scrollable with fixed topbar */}
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
          {/* Single scroll container with flex column layout */}
          <div className="flex-1 flex flex-col overflow-auto">
            {/* Sticky Topbar - stays at top while content scrolls behind */}
            <div className="sticky top-0 z-20">
              <Topbar
                mini={mini}
                isSidebarOpen={mobileOpen}
                onToggleMini={() => setMini((v) => !v)}
                onToggleMobile={() => setMobileOpen((v) => !v)}
              />
            </div>
            
            {/* Page content - flex-1 to push footer to bottom */}
            <main className="flex-1 px-8 pt-5 pb-10">
              <Outlet />
            </main>
            
            {/* Footer - sticky at bottom */}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
