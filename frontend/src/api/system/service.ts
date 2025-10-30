// src/api/system/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type { HealthzResponse, RunsReponse } from "./types";
import { http as defaultHttp } from "@/lib/http";

export class SystemService {
  constructor(private http: HttpClient = defaultHttp) {}

  getHealthz() {
    return this.http.get<HealthzResponse>(Endpoints.HEALTHZ);
  }

  getRuns() {
    const params = {
      limit: 100,
    };
    return this.http.get<RunsReponse>(Endpoints.RUNS, { params });
  }
}
