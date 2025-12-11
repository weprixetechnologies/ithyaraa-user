import axios from 'axios';
import { getCookie, setCookieEasy } from './setCookie';
import { toast } from 'react-toastify';
import {
    storeRedirectUrl,
    storePendingRequest,
    clearAllRedirectData,
    generateRequestId,
    shouldRetryRequest
} from './redirectUtils';

// Detect API URL based on environment
const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
            return 'https://api.ithyaraa.com/api';
        }
    }
    return 'https://api.ithyaraa.com/api';
};

const redirectToLogin = (originalRequest = null) => {
    console.log('[redirectToLogin] Clearing cookies and redirecting to login');
    document.cookie = '_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = '_rt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    // If this was an API request, store it for retry
    if (originalRequest && shouldRetryRequest(originalRequest)) {
        const requestId = generateRequestId(originalRequest);
        storePendingRequest(originalRequest, requestId);
        console.log('[redirectToLogin] Stored pending request:', requestId);
    }

    // Store current URL for redirect after login (for API-triggered redirects)
    const currentUrl = window.location.pathname + window.location.search;
    storeRedirectUrl(currentUrl);

    // Full page reload — no SPA history
    // The middleware will handle the redirect with proper URL parameters
    window.location.href = '/login';
};

const axiosInstance = axios.create({
    baseURL: getApiUrl(),
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = getCookie('_at');
        console.log('[Request interceptor] Access token:', accessToken ? '[present]' : '[not present]');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        console.log('[Request interceptor] Error:', error);
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
    console.log('[onRefreshed] Notifying subscribers with new token');
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
    console.log('[addRefreshSubscriber] Adding subscriber');
    refreshSubscribers.push(callback);
}

axiosInstance.interceptors.response.use(
    (response) => {
        console.log('[Response interceptor] Success:', response.status, response.config.url);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        console.log('[Response interceptor] Error:', error.response?.status, originalRequest?.url);

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('[Response interceptor] 401 Unauthorized detected');

            if (isRefreshing) {
                console.log('[Response interceptor] Refresh already in progress, queuing request');
                return new Promise((resolve) => {
                    addRefreshSubscriber((newToken) => {
                        console.log('[Response interceptor] Retrying original request with new token');
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;
            console.log('[Response interceptor] Starting token refresh');

            const refreshToken = getCookie('_rt');
            console.log('[Response interceptor] Refresh token:', refreshToken ? '[present]' : '[not present]');

            if (!refreshToken) {
                console.log('[Response interceptor] No refresh token found, redirecting to login');
                toast.error('Session expired. Please login again.');
                redirectToLogin(originalRequest);
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(
                    '/auth/refresh-token',
                    { refreshToken },
                    { baseURL: axiosInstance.defaults.baseURL }
                );

                const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;
                console.log(newAccessToken);

                if (!newAccessToken || !newRefreshToken) {
                    console.log('[Response interceptor] Refresh response missing tokens, redirecting to login');
                    toast.error('Session expired. Please login again.');
                    redirectToLogin(originalRequest);
                    return Promise.reject(error);
                }

                console.log('[Response interceptor] Refresh successful, setting new tokens');
                setCookieEasy('_at', newAccessToken, 7);
                setCookieEasy('_rt', newRefreshToken, 7);

                axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                onRefreshed(newAccessToken);
                isRefreshing = false;

                console.log('[Response interceptor] Retrying original request with new access token');
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                console.log('[Response interceptor] Token refresh failed, redirecting to login', refreshError);
                toast.error('Session expired. Please login again.');
                redirectToLogin(originalRequest);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
