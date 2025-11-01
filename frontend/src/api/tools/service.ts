import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type { PdaReportsResponse } from "./types";
import { http as defaultHttp } from "@/lib/http";

export class ToolsService {
  constructor(private http: HttpClient = defaultHttp) {}

  getPdaReports(params: { page: number; page_size: number }) {
    return this.http.get<PdaReportsResponse>(Endpoints.PDA_REPORT, { params });
  }
}
