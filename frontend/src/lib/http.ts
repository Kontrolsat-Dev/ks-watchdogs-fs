// src/lib/http.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import { authStore } from "@/lib/auth-store";

const tokenProvider = () => authStore.get(); // <- lê do authStore

export const http = new HttpClient({
  baseUrl: Endpoints.BASE_URL,
  token: tokenProvider,
  headers: { Accept: "application/json" },
  timeoutMs: 15000,
});
