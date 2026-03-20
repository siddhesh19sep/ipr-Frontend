import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ipr-backend-u4al.onrender.com/api', 
});

// Request interceptor for adding the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const globalSearch = (query: string) => api.get(`/search/global?query=${query}`);

// Licensing
export const verifyLogin = (data: any) => api.post("/auth/verify-login", data);
export const purchaseLicense = (data: any) => api.post("/licenses/purchase", data);
export const getMyLicenses = () => api.get("/licenses/my-licenses");
export const getAssetLicenses = (ipId: string) => api.get(`/licenses/asset/${ipId}`);

// Renewals & Alerts
export const renewIP = (id: string, data: any) => api.put(`/ip/${id}/renew`, data);
export const transferOwnership = (id: string, data: any) => api.put(`/ip/${id}/transfer`, data);
export const checkExpirations = () => api.post("/ip/check-expirations");
export const getMyAlerts = () => api.get("/alerts");
export const markAlertAsRead = (id: string) => api.put(`/alerts/${id}/read`);

export default api;
