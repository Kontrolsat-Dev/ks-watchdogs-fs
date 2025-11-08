import { http as defaultHttp } from "@/lib/http";
import { HttpClient } from "@/lib/http-client";
import type { HomeSummary } from "./types";
import { Endpoints } from "@/constants/endpoints";

export class HomeService {
  constructor(private http: HttpClient = defaultHttp) {}

  getHomeSummary(params: { window: string }) {
    return this.http.get<HomeSummary>(Endpoints.HOME_SUMMARY, { params });
  }
}
