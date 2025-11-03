import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type { PdaReportsResponse, PatifeHealthzResponse } from "./types";
import { http as defaultHttp } from "@/lib/http";

export class ToolsService {
  constructor(private http: HttpClient = defaultHttp) {}

  // Pda
  // - Reports
  getPdaReports(params: { page: number; page_size: number }) {
    return this.http.get<PdaReportsResponse>(Endpoints.PDA_REPORT, { params });
  }

  // Patife
  // - Healthz
  getHealthz(params: { page: number; page_size: number }) {
    const response = this.http.get<PatifeHealthzResponse>(
      Endpoints.PATIFE_HEALTHZ,
      {
        params,
      }
    );
    return response;
  }
}
