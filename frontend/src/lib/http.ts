// src/lib/http.ts
export async function http<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { "accept": "application/json", ...(init?.headers || {}) },
        ...init,
    })

    if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`)
    }

    return res.json() as Promise<T>
}
