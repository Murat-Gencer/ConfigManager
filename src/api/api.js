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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
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

        // Backend'e göre request body'yi düzenle
        const response = await request.post('/auth/login', {
          usernameOrEmail: email,  // Backend 'usernameOrEmail' bekliyor
          password: password
        });


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


        return {
          success: true,
          data: { token, user }
        };
      } catch (error) {
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
  projects: {
    getAll: async () => {
      const response = await request.get('/projects');
      return response.data;
    },
    getById: async (id) => {
      const response = await request.get(`/projects/${id}`);
      return response.data;
    },
    create: async (projectData) => {
      const response = await request.post('/projects', projectData);
      return response.data;
    },
    update: async (id, projectData) => {
      const response = await request.put(`/projects/${id}`, projectData);
      return response.data;
    },
    delete: async (id) => {
      const response = await request.delete(`/projects/${id}`);
      return response.data;
    }
  },
  configs: {

    getByEnvironment: async (projectId, environment) => {
      const response = await request.get(`/config/${environment}/${projectId}`);
      return response.data;
    },

    // Tekli ekleme
    create: async (configData) => {
      const response = await request.post('/config', configData);
      return response.data;
    },

    // Toplu ekleme
    batchCreate: async (batchData) => {
      const response = await request.post('/config/batch', batchData);
      return response.data;
    },
    update: async (configId, configData) => {
      const response = await request.put(`/config/${configId}`, configData);
      return response.data;
    },

    delete: async (configId, environment) => {
      const response = await request.delete(`/config/${environment}/${configId}`);
      return response.data;
    }
  }

};

export default apiService;