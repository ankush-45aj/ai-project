import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite will proxy this to http://localhost:5000
  withCredentials: true, // if using cookies/session (optional)
});

export default api;
