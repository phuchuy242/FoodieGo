const envApiBase = String(import.meta.env?.VITE_API_BASE || "").trim();

const defaultApiBase = "https://untaut-wickedly-amina.ngrok-free.dev";

export const API_BASE = (envApiBase || defaultApiBase).replace(/\/+$/, "");

const NGROK_HEADERS = {
    "ngrok-skip-browser-warning": "true",
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export async function apiFetch(url, options = {}) {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    const token = localStorage.getItem('accessToken');
    
    const headers = {
        ...NGROK_HEADERS,
        ...(options.headers || {}),
    };
    
    if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const fetchOptions = { ...options, headers };

    let response = await fetch(fullUrl, fetchOptions);

    if (response.status === 401) {
        if (fullUrl.includes('/api/v1/users/refresh/')) {
            return response;
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            window.dispatchEvent(new Event('auth-expired'));
            return response;
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(newToken => {
                fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
                return fetch(fullUrl, fetchOptions);
            }).catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            const refreshRes = await fetch(`${API_BASE}/api/v1/users/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...NGROK_HEADERS
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            const refreshData = await refreshRes.json();

            if (!refreshRes.ok || refreshData.status === 'error') {
                throw new Error('Refresh token invalid');
            }

            const newToken = refreshData.data?.access_token || refreshData.data?.access || refreshData.access_token || refreshData.access;
            if (newToken) {
                localStorage.setItem('accessToken', newToken);
                fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
                processQueue(null, newToken);
                response = await fetch(fullUrl, fetchOptions);
            } else {
                throw new Error('No access token in response');
            }
        } catch (error) {
            processQueue(error, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth-expired'));
        } finally {
            isRefreshing = false;
        }
    }

    return response;
}