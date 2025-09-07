import axios from 'axios';

// 1. Axios instance'ı oluşturma
const api = axios.create({
  
  baseURL: 'http://localhost:5000/api',
});

// 2. Request Interceptor (İstek Yakalayıcı)

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Yanıt Yakalayıcı)

api.interceptors.response.use(
  
  (response) => {
    return response;
  },
  
  (error) => {
   
    if (error.response && error.response.status === 401) {
     
      localStorage.removeItem('token');
      localStorage.removeItem('user');

     
      window.location.href = '/login';
    }

    
    return Promise.reject(error);
  }
);

export default api;