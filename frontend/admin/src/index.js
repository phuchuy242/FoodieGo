
import React from "react";
import { HashRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import { base_path } from "./environment.jsx";
import '../src/style/css/feather.css'
import '../src/style/css/line-awesome.min.css'
import "../src/style/scss/main.scss";
import '../src/style/icons/fontawesome/css/fontawesome.min.css'
import '../src/style/icons/fontawesome/css/all.min.css'


import { Provider } from "react-redux";
import store from "./core/redux/store.jsx";
import AllRoutes from "./Router/router.jsx";
import axios from 'axios';
import { API_BASE } from './environment.jsx';

// Cấu hình Axios toàn cục cho Admin
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
});

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

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url.includes('/api/v1/users/refresh/')) {
                return Promise.reject(error);
            }
            
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                window.location.href = '#/signin';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axios(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(`${API_BASE}/api/v1/users/refresh/`, { refresh_token: refreshToken });
                const token = res.data?.data?.access_token || res.data?.access || res.data?.access_token;
                
                if (token) {
                    localStorage.setItem('token', token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    processQueue(null, token);
                    return axios(originalRequest);
                } else {
                    throw new Error("No token");
                }
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '#/signin';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

const rootElement = document.getElementById('root');



if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
    <Provider store={store} >
      <HashRouter>
      <AllRoutes />
      </HashRouter>
    </Provider>
  </React.StrictMode>
  );
} else {
  console.error("Element with id 'root' not found.");
}
