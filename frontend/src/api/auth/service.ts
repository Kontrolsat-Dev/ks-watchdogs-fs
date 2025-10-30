// src/api/auth/service.ts
// Serviço de API para autenticação de utilizadores

import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type { LoginRequest, LoginResponse } from "./types";
import { http as defaultHttp } from "@/lib/http";

export class AuthService {
  constructor(private http: HttpClient = defaultHttp) {}

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(Endpoints.AUTH_LOGIN, payload);
  }

  me() {
    return this.http.get<Record<string, unknown>>(Endpoints.AUTH_ME);
  }
}

export type { LoginRequest, LoginResponse };
