// src/api/kpi/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type {
  EmployeeRole,
  Granularity,
  OrderBy,
  OrderDir,
  EmployeeTimeseriesResponse,
  EmployeePerformanceResponse,
  StoreFrontMetricsResponse,
} from "./types";
import { http as defaultHttp } from "@/lib/http";

export class KpiService {
  constructor(private http: HttpClient = defaultHttp) {}

  getOrdersProcessingTimeseries(params: {
    role: EmployeeRole;
    gran: Granularity;
    since: string; // DD-MM-YYYY
    until: string; // DD-MM-YYYY
  }) {
    return this.http.get<EmployeeTimeseriesResponse>(
      Endpoints.KPI_EMPLOYEE_ORDERS_PROCESSING_TIMESERIES,
      { params }
    );
  }

  getOrdersProcessingPerformance(params: {
    role: EmployeeRole;
    since: string; // DD-MM-YYYY
    until: string; // DD-MM-YYYY
    order_by?: OrderBy;
    order_dir?: OrderDir;
    limit?: number;
  }) {
    const {
      role,
      since,
      until,
      order_by = "avg",
      order_dir = "asc",
      limit = 200,
    } = params;

    return this.http.get<EmployeePerformanceResponse>(
      Endpoints.KPI_EMPLOYEE_ORDERS_PROCESSING_PERFORMANCE,
      {
        params: { role, since, until, order_by, order_dir, limit },
      }
    );
  }

  getStoreFrontMetrics(params: {
    since: string; // DD-MM-YYYY
  }) {
    return this.http.get<StoreFrontMetricsResponse>(
      Endpoints.KPI_STORE_FRONT_METRICS,
      { params }
    );
  }
}
