// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSyncExternalStore } from "react";
import { authStore } from "@/lib/auth-store";

function useAuthToken() {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.get,
    authStore.get
  );
}

export default function PublicLayout() {
  const token = useAuthToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
