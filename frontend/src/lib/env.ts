// src/lib/env.ts
import { z } from "zod"

// validação dos envs em tempo de build/run
const EnvSchema = z.object({
    // App
    VITE_API_BASE_URL: z.string().url().default("http://127.0.0.1:8000/api/v1"),
    VITE_API_HEALTH_URL: z.string().url().default("http://127.0.0.1:8000/api/v1/healthz"),

    // Prestashop
    VITE_API_ALERTS:z.string().url().default("http://127.0.0.1:8000/api/v1/alerts"),
    VITE_API_ORDERS:z.string().url().default("http://127.0.0.1:8000/api/v1/prestashop/orders/delayed"),
    VITE_API_PAYMENTS:z.string().url().default("http://127.0.0.1:8000/api/v1/prestashop/payments"),
    VITE_API_PRODUCTS_EOL:z.string().url().default("http://127.0.0.1:8000/api/v1/prestashop/products/eol"),

    // Runs
    VITE_API_RUNS:z.string().url().default("http://127.0.0.1:8000/api/v1/runs"),
})

// import.meta.env já é fornecido pelo Vite
export const env = EnvSchema.parse(import.meta.env)

// API base para usar nos fetch
export const BASE_URL = env.VITE_API_BASE_URL
export const HEALTH_API = env.VITE_API_HEALTH_URL
export const API_ALERTS = env.VITE_API_ALERTS
export const API_RUNS = env.VITE_API_RUNS
export const API_ORDERS = env.VITE_API_ORDERS
export const API_PAYMENTS = env.VITE_API_PAYMENTS
export const API_PRODUCTS_EOL = env.VITE_API_PRODUCTS_EOL
