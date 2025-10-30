// src/api/prestashop/service.ts
import { HttpClient } from "@/lib/http-client";
import { Endpoints } from "@/constants/endpoints";
import type {
  CartAbandonedResponse,
  DelayedOrdersResponse,
  PaymentsResponse,
  PerfResponse,
  ProductsEolReponse,
} from "./types";
import { http as defaultHttp } from "@/lib/http";

export class PrestashopService {
  constructor(private http: HttpClient = defaultHttp) {}

  getDelayedOrders() {
    return this.http.get<DelayedOrdersResponse>(
      Endpoints.PRESTASHOP_ORDERS_DELAYED
    );
  }

  getAbandonedCarts() {
    return this.http.get<CartAbandonedResponse>(
      Endpoints.PRESTASHOP_ABANDONED_CARTS
    );
  }

  getPayments() {
    return this.http.get<PaymentsResponse>(Endpoints.PRESTASHOP_PAYMENTS);
  }

  getProductsEol() {
    return this.http.get<ProductsEolReponse>(Endpoints.PRESTASHOP_PRODUCTS_EOL);
  }

  getPagesSpeed() {
    return this.http.get<PerfResponse>(Endpoints.VITE_PRESTASHOP_PAGES_STATUS);
  }
}
