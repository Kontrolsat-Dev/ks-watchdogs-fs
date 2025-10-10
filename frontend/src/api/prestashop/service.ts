import { PRESTASHOP_API_CONFIG } from "./config";
import type {DelayedOrdersResponse, ProductsEolReponse} from "@/api/prestashop/types";

type Params = Record<string, string | number | boolean | Array<string | number | boolean>>;

export class PrestashopService {
    private readonly baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl ?? PRESTASHOP_API_CONFIG.BASE_URL;
    }

    private buildUrl(endpoint: string, params?: Params): string {
        const url = new URL(endpoint, this.baseUrl);

        if (params) {
            for (const [k, v] of Object.entries(params)) {
                if (Array.isArray(v)) {
                    for (const item of v) url.searchParams.append(k, String(item));
                } else if (v !== undefined && v !== null) {
                    url.searchParams.set(k, String(v));
                }
            }
        }

        return url.toString(); // sem "?" se não houver params
    }

    private async fetchData<T>(url: string): Promise<T> {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return res.json() as Promise<T>;
    }


    // -------------------------- Orders
    async getDelayedOrders(): Promise<DelayedOrdersResponse> {
        const url = this.buildUrl(PRESTASHOP_API_CONFIG.PRESTASHOP_ORDERS_DELAYED);
        return this.fetchData<DelayedOrdersResponse>(url);
    }


    // -------------------------- Payments
    async getPayments(): Promise<PaymentResponse> {
        const url = this.buildUrl(PRESTASHOP_API_CONFIG.PRESTASHOP_PAYMENTS);
        return this.fetchData<PaymentResponse>(url);
    }

    // -------------------------- Products
    async getProductsEol(): Promise<ProductsEolReponse>{
        const url = this.buildUrl(PRESTASHOP_API_CONFIG.PRESTASHOP_PRODUCTS_EOL);
        return this.fetchData<ProductsEolReponse>(url);
    }

    // -------------------------- Pages TBD
}
