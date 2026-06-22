import axios from 'axios';

const normalizeBaseURL = (url = '') => String(url).replace(/\/+$/, '');

const primaryBaseURL = normalizeBaseURL(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
);

const fallbackBaseURLs = [
  primaryBaseURL,
  'http://localhost:5001/api',
  'http://127.0.0.1:5000/api',
  'http://127.0.0.1:5001/api'
]
  .map(normalizeBaseURL)
  .filter((url, index, arr) => url && arr.indexOf(url) === index);

const api = axios.create({
  baseURL: primaryBaseURL,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('biit_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('biit_token');
      localStorage.removeItem('biit_user');
      
      // Redirect to login page on JWT expiration
      window.location.href = '/admin/login';
    }

    const originalRequest = error?.config;

    const shouldTryFallback =
      originalRequest &&
      !originalRequest.__fallbackCompleted &&
      !error?.response &&
      error?.code !== 'ERR_CANCELED';

    if (shouldTryFallback) {
      originalRequest.__fallbackCompleted = true;

      for (const baseURL of fallbackBaseURLs) {
        if (normalizeBaseURL(originalRequest.baseURL) === baseURL) {
          continue;
        }

        try {
          return await api.request({
            ...originalRequest,
            baseURL
          });
        } catch (fallbackError) {
          error = fallbackError;

          if (fallbackError?.response) {
            break;
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;