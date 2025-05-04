import axios from 'axios';

// Create axios instance with base URL
export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server returned an error response
      if (error.response.status === 401) {
        // Unauthorized - clear stored credentials
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    return Promise.reject(error);
  }
);

// Add auth token to requests if available
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}