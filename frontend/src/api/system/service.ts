import { SYSTEM_API_CONFIG } from "./config";
import type { HealthzResponse } from "./types";

type Params = Record<string, string | number | boolean | Array<string | number | boolean>>;

export class SystemService {
    private readonly baseUrl: string;

    constructor(baseUrl?: string) {
        this.baseUrl = baseUrl ?? SYSTEM_API_CONFIG.BASE_URL;
    }

    private buildUrl(endpoint: string, params?: Params): string {
        const url = new URL(this.baseUrl);
        const cleanBase = url.pathname.replace(/\/+$/,"");
        const cleanEp = endpoint.replace(/^\/+/,"");
        url.pathname = [cleanBase, cleanEp].filter(Boolean).join("/");

        if (params) {
            for (const [k, v] of Object.entries(params)) {
                if (Array.isArray(v)) v.forEach(it => url.searchParams.append(k, String(it)));
                else if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
            }
        }
        return url.toString();
    }

    private async fetchData<T>(url: string): Promise<T> {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) {
            let body = "";
            try { body = (await res.text()).slice(0, 300); } catch {}
            throw new Error(`HTTP ${res.status} ${res.statusText} @ ${url} ${body ? `— ${body}` : ""}`);
        }
        return res.json() as Promise<T>;
    }

    async getHealthz(): Promise<HealthzResponse> {
        const url = this.buildUrl(SYSTEM_API_CONFIG.HEALTHZ);
        return this.fetchData<HealthzResponse>(url);
    }
}
