// src/api/prestashop/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type {
  DelayedOrdersResponse,
  PaymentsResponse,
  ProductsEolReponse,
} from "./types";

export class PrestashopService {
  private http: HttpClient;

  constructor(http?: HttpClient) {
    this.http = http ?? new HttpClient({ baseUrl: Endpoints.BASE_URL });
  }

  getDelayedOrders() {
    return this.http.get<DelayedOrdersResponse>(
      Endpoints.PRESTASHOP_ORDERS_DELAYED
    );
  }

  getPayments() {
    return this.http.get<PaymentsResponse>(Endpoints.PRESTASHOP_PAYMENTS);
  }

  getProductsEol() {
    return this.http.get<ProductsEolReponse>(Endpoints.PRESTASHOP_PRODUCTS_EOL);
  }
}
