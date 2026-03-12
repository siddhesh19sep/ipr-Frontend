import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ipr-backend-u4al.onrender.com/api', 
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

export default api;
