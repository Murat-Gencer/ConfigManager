import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Request:', config.method.toUpperCase(), config.url, config.data);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Token geçersiz - logout yap
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const request = {
  get: async (url, config = {}) => {
    return api.get(url, config);
  },
  post: async (url, data, config = {}) => {
    return api.post(url, data, config);
  },
  put: async (url, data, config = {}) => {
    return api.put(url, data, config);
  },
  delete: async (url, config = {}) => {
    return api.delete(url, config);
  }
};

const apiService = {
  auth: {
    login: async (email, password) => {
      try {
        console.log('🔐 Attempting login for:', email);
        
        // Backend'e göre request body'yi düzenle
        const response = await request.post('/auth/login', { 
          usernameOrEmail: email,  // Backend 'usernameOrEmail' bekliyor
          password: password 
        });
        
        console.log('📦 Login response:', response.data);
        
        // Backend'den gelen response: { userId, token, username }
        const { token, username, userId } = response.data;
        
        if (!token || !username) {
          throw new Error('Invalid response from server');
        }
        
        // User object'i oluştur
        const user = {
          id: userId,
          username: username,
          email: email // Email'i kendimiz saklıyoruz
        };
        
        // Token ve user'ı sakla
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Login successful, token saved');
        
        return { 
          success: true, 
          data: { token, user } 
        };
      } catch (error) {
        console.error('❌ Login failed:', error);
        return { 
          success: false, 
          error: error.response?.data?.message || error.message || 'Login failed' 
        };
      }
    },
    
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    getCurrentUser: () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    },
    
    isAuthenticated: () => {
      return !!localStorage.getItem('token');
    }
  },
};

export default apiService;