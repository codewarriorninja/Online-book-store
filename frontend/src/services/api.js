import axios from "axios";

//Create axios instance with base URL
const api = axios.create({
    baseURL:'/api',
    headers:{
        'Content-Type':'application/json',
    },
    withCredentials: true, // Enable sending cookies with cross-origin requests
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

export default api