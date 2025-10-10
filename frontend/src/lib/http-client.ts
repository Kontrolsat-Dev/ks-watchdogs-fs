// src/lib/http-client.ts (sem mudanças problemáticas)
export type ParamValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>;
export type Params = Record<string, ParamValue>;

export class HttpClient {
  private base: URL;
  private defaultHeaders: Record<string, string>;
  private timeoutMs: number;

  constructor(opts: {
    baseUrl: string;
    defaultHeaders?: Record<string, string>;
    timeoutMs?: number;
  }) {
    this.base = new URL(opts.baseUrl);
    this.defaultHeaders = {
      Accept: "application/json",
      ...(opts.defaultHeaders ?? {}),
    };
    this.timeoutMs = opts.timeoutMs ?? 15000;
  }

  buildUrl(endpoint: string, params?: Params): string {
    const url = new URL(this.base.toString());
    const cleanBase = url.pathname.replace(/\/+$/, "");
    const cleanEp = endpoint.replace(/^\/+/, "");
    url.pathname = [cleanBase, cleanEp].filter(Boolean).join("/");
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (Array.isArray(v))
          v.forEach((it) => url.searchParams.append(k, String(it)));
        else if (v != null) url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }

  async request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(input, {
        headers: { ...this.defaultHeaders, ...(init?.headers || {}) },
        signal: controller.signal,
        ...init,
      });
      const ct = res.headers.get("content-type") || "";
      const isJson = ct.includes("application/json");
      const url = typeof input === "string" ? input : (input as Request).url;

      if (!res.ok) {
        const snippet = (
          isJson ? JSON.stringify(await res.json()) : await res.text()
        ).slice(0, 300);
        throw new Error(
          `HTTP ${res.status} ${res.statusText} @ ${url}${
            snippet ? ` — ${snippet}` : ""
          }`
        );
      }
      if (!isJson) throw new Error(`Non-JSON response @ ${url}`);
      return (await res.json()) as T;
    } finally {
      clearTimeout(id);
    }
  }

  get<T>(endpoint: string, params?: Params, init?: RequestInit) {
    return this.request<T>(this.buildUrl(endpoint, params), {
      method: "GET",
      ...init,
    });
  }
  post<T>(endpoint: string, body?: unknown, init?: RequestInit) {
    return this.request<T>(this.buildUrl(endpoint), {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      ...init,
    });
  }
}
