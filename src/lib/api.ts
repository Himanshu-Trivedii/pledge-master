import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for handling errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const userApi = {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/users', userData),
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data) => apiClient.put(`/users/${data.id}`, data),
};

export const pledgeApi = {
    create: (pledgeData) => apiClient.post('/pledges', pledgeData),
    getAll: () => apiClient.get('/pledges'),
    getById: (id) => apiClient.get(`/pledges/${id}`),
    getByUser: (userId) => apiClient.get(`/pledges/user/${userId}`),
    update: (id, data) => apiClient.put(`/pledges/${id}`, data),
    delete: (id) => apiClient.delete(`/pledges/${id}`),
};

export const transactionApi = {
    create: (transactionData) => apiClient.post('/transactions', transactionData),
    getAll: () => apiClient.get('/transactions'),
    getById: (id) => apiClient.get(`/transactions/${id}`),
    getByPledge: (pledgeId) => apiClient.get(`/transactions/pledge/${pledgeId}`),
    update: (id, data) => apiClient.put(`/transactions/${id}`, data),
    delete: (id) => apiClient.delete(`/transactions/${id}`),
};