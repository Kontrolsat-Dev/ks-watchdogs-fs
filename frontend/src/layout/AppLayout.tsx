import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "sidebar_collapsed_v1";

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-background to-muted text-foreground">
      <div className="flex h-full">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar
            collapsed={collapsed}
            isSidebarOpen={mobileOpen}
            onToggleCollapse={() => setCollapsed((v) => !v)}
            onToggleMobile={() => setMobileOpen((v) => !v)}
          />
          <main className="flex-1 overflow-auto px-8 pt-5 pb-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
