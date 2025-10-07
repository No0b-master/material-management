import axios from 'axios';
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE as string;

let accessTokenMemory: string | null = null;
let refreshTokenMemory: string | null = null;
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string | null) => void; reject: (err: any) => void }> = [];

export function setAuthTokens(tokens: { accessToken: string; refreshToken: string } | null) {
  accessTokenMemory = tokens?.accessToken ?? null;
  refreshTokenMemory = tokens?.refreshToken ?? null;
}

function onTokenRefreshed(newToken: string | null) {
  pendingQueue.forEach(({ resolve }) => resolve(newToken));
  pendingQueue = [];
}

function addPendingPromise() {
  return new Promise<string | null>((resolve, reject) => {
    pendingQueue.push({ resolve, reject });
  });
}

export const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config: AxiosRequestConfig) => {
  if (accessTokenMemory) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${accessTokenMemory}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const rt = refreshTokenMemory;
          if (!rt) throw new Error('Missing refresh token');
          const resp = await axios.post(`${apiBaseUrl}/auth/refresh`, { refreshToken: rt });
          const newAccess = (resp.data as any).accessToken as string;
          accessTokenMemory = newAccess;
          onTokenRefreshed(newAccess);
          return api(original);
        } catch (e) {
          onTokenRefreshed(null);
          throw e;
        } finally {
          isRefreshing = false;
        }
      } else {
        const newToken = await addPendingPromise();
        if (!newToken) throw error;
        return api(original);
      }
    }
    throw error;
  }
);
