import axios from 'axios';
import { toast } from 'react-toastify';

const PROD_API = 'https://responsible-rebirth-production-79053fb3.up.railway.app/api';
const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
export const API_URL = (process.env.REACT_APP_API_URL || (isLocal ? 'http://localhost:8000/api' : PROD_API)).replace(/\/+$/, '');

const axiosInstance = axios.create({ baseURL: API_URL, timeout: 60000 });

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// One shared refresh so parallel 401s don't race (refresh tokens rotate).
let refreshing = null;
const refreshAccess = () => {
  if (!refreshing) {
    refreshing = axios
      .post(`${API_URL}/auth/refresh/`, { refresh: localStorage.getItem('refresh_token') })
      .then((r) => {
        localStorage.setItem('access_token', r.data.access);
        if (r.data.refresh) localStorage.setItem('refresh_token', r.data.refresh);
        return r.data.access;
      })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
};

const isAuthCall = (url = '') => /\/auth\/(login|refresh|register)\//.test(url);

// Turn a DRF error payload into a readable string.
export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  const d = error?.response?.data;
  if (!d) return error?.code === 'ECONNABORTED' ? 'The server took too long to respond.' : fallback;
  if (typeof d === 'string') return d;
  if (d.error) return d.error;
  if (d.detail) return d.detail;
  const parts = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : typeof v === 'object' ? JSON.stringify(v) : v}`);
  return parts.join(' | ') || fallback;
};

axiosInstance.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    // Login/refresh/register 401s are real answers, not an expired session.
    if (status === 401 && !original._retry && !isAuthCall(original.url) && localStorage.getItem('refresh_token')) {
      original._retry = true;
      try {
        const access = await refreshAccess();
        original.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(original);
      } catch (e) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }
    if (!original.silent && !isAuthCall(original.url) && status !== 401 && status !== 404) {
      toast.error(errorMessage(error));
    }
    return Promise.reject(error);
  }
);

// Authenticated file download (files are never public)
export const downloadFile = async (url, fallbackName = 'download') => {
  const res = await axiosInstance.get(url, { responseType: 'blob' });
  const cd = res.headers['content-disposition'] || '';
  const m = /filename="?([^";]+)"?/.exec(cd);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(res.data);
  a.download = m ? m[1] : fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

export default axiosInstance;
