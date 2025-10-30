// src/api/system/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type { HealthzResponse, RunsReponse } from "./types";

export class SystemService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: Endpoints.BASE_URL });
  }

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
