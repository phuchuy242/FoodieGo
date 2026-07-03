const envApiBase = String(import.meta.env?.VITE_API_BASE || "").trim();

const defaultApiBase = "https://untaut-wickedly-amina.ngrok-free.dev";

export const API_BASE = (envApiBase || defaultApiBase).replace(/\/+$/, "");

const NGROK_HEADERS = {
    "ngrok-skip-browser-warning": "true",
};

export function apiFetch(url, options = {}) {

    // nếu url đã là http thì dùng luôn
    const fullUrl = url.startsWith("http")
        ? url
        : `${API_BASE}${url}`;

    return fetch(fullUrl, {
        ...options,
        headers: {
            ...NGROK_HEADERS,
            ...(options.headers || {}),
        },
    });
}