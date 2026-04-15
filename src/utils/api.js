import axios from 'axios';

// Tạo một instance axios với URL cơ bản trỏ tới backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm Interceptor: Tự động đính kèm Token vào mọi Request nếu người dùng đã đăng nhập
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('token');
    if (typeof token === 'string' && token.trim()) {
      token = token.trim().replace(/^Bearer\s+/i, '');
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      // Avoid infinite redirect loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
