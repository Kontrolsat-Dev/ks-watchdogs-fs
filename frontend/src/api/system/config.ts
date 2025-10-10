export const SYSTEM_API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    HEALTHZ: import.meta.env.VITE_API_HEALTH_URL || '/healthz',
};
