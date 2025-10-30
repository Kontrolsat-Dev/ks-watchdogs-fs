// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSyncExternalStore } from "react";
import { authStore } from "@/lib/auth-store";
import { useMeQuery } from "@/features/auth/login/queries";
import { HttpError } from "@/lib/http-client";

function useAuthToken() {
  return useSyncExternalStore(
    authStore.subscribe,
    authStore.get,
    authStore.get
  );
}

export default function RequireAuth() {
  const token = useAuthToken();
  const location = useLocation();

  // Sem token → login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Com token → valida no backend
  const { isLoading, isError, error } = useMeQuery(true);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">A validar sessão…</div>
    );
  }

  // Se /auth/me falhar com 401/403 → limpa token e volta ao login
  if (
    isError &&
    error instanceof HttpError &&
    (error.status === 401 || error.status === 403)
  ) {
    authStore.set(null);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
