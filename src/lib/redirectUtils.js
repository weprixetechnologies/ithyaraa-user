// Utility functions for handling redirects and pending requests after login

const REDIRECT_KEY = 'redirectAfterLogin';
const PENDING_REQUESTS_KEY = 'pendingRequests';
const REQUEST_TIMEOUT = 10 * 60 * 1000; // 10 minutes

/**
 * Store the current URL as redirect destination
 * @param {string} url - The URL to redirect to after login
 */
export const storeRedirectUrl = (url) => {
    if (typeof window !== 'undefined') {
        try {
            const redirectData = {
                url,
                timestamp: Date.now()
            };
            sessionStorage.setItem(REDIRECT_KEY, JSON.stringify(redirectData));
            console.log('[storeRedirectUrl] Stored redirect URL:', url);
        } catch (error) {
            console.error('[storeRedirectUrl] Error storing redirect URL:', error);
        }
    }
};

/**
 * Get the stored redirect URL and clear it
 * @returns {string|null} - The stored redirect URL or null if none exists or expired
 */
export const getAndClearRedirectUrl = () => {
    if (typeof window !== 'undefined') {
        try {
            const stored = sessionStorage.getItem(REDIRECT_KEY);
            if (!stored) return null;

            const redirectData = JSON.parse(stored);
            const now = Date.now();
            
            // Check if the redirect data is expired
            if (now - redirectData.timestamp > REQUEST_TIMEOUT) {
                console.log('[getAndClearRedirectUrl] Redirect data expired, clearing');
                sessionStorage.removeItem(REDIRECT_KEY);
                return null;
            }

            sessionStorage.removeItem(REDIRECT_KEY);
            console.log('[getAndClearRedirectUrl] Retrieved redirect URL:', redirectData.url);
            return redirectData.url;
        } catch (error) {
            console.error('[getAndClearRedirectUrl] Error retrieving redirect URL:', error);
            sessionStorage.removeItem(REDIRECT_KEY);
            return null;
        }
    }
    return null;
};

/**
 * Store a pending request to retry after login
 * @param {Object} requestConfig - The axios request configuration
 * @param {string} requestId - Unique identifier for the request
 */
export const storePendingRequest = (requestConfig, requestId) => {
    if (typeof window !== 'undefined') {
        try {
            const pendingRequests = JSON.parse(sessionStorage.getItem(PENDING_REQUESTS_KEY) || '[]');
            
            // Remove any existing request with the same ID
            const filteredRequests = pendingRequests.filter(req => req.id !== requestId);
            
            const pendingRequest = {
                id: requestId,
                config: {
                    url: requestConfig.url,
                    method: requestConfig.method,
                    data: requestConfig.data,
                    params: requestConfig.params,
                    headers: {
                        ...requestConfig.headers,
                        // Remove authorization header as it will be added fresh
                        Authorization: undefined
                    }
                },
                timestamp: Date.now()
            };
            
            filteredRequests.push(pendingRequest);
            sessionStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(filteredRequests));
            console.log('[storePendingRequest] Stored pending request:', requestId);
        } catch (error) {
            console.error('[storePendingRequest] Error storing pending request:', error);
        }
    }
};

/**
 * Get and clear all pending requests
 * @returns {Array} - Array of pending requests
 */
export const getAndClearPendingRequests = () => {
    if (typeof window !== 'undefined') {
        try {
            const stored = sessionStorage.getItem(PENDING_REQUESTS_KEY);
            if (!stored) return [];

            const pendingRequests = JSON.parse(stored);
            const now = Date.now();
            
            // Filter out expired requests
            const validRequests = pendingRequests.filter(req => 
                now - req.timestamp <= REQUEST_TIMEOUT
            );
            
            // Clear all requests from storage
            sessionStorage.removeItem(PENDING_REQUESTS_KEY);
            
            console.log('[getAndClearPendingRequests] Retrieved pending requests:', validRequests.length);
            return validRequests;
        } catch (error) {
            console.error('[getAndClearPendingRequests] Error retrieving pending requests:', error);
            sessionStorage.removeItem(PENDING_REQUESTS_KEY);
            return [];
        }
    }
    return [];
};

/**
 * Clear all stored redirect data
 */
export const clearAllRedirectData = () => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem(REDIRECT_KEY);
        sessionStorage.removeItem(PENDING_REQUESTS_KEY);
        console.log('[clearAllRedirectData] Cleared all redirect data');
    }
};

/**
 * Check if user is trying to access a protected route
 * @param {string} pathname - Current pathname
 * @returns {boolean} - True if it's a protected route
 */
export const isProtectedRoute = (pathname) => {
    const protectedRoutes = [
        '/profile',
        '/cart',
        '/wishlist',
        '/orders',
        '/checkout',
        '/make-combo'
    ];
    
    return protectedRoutes.some(route => pathname.startsWith(route));
};

/**
 * Generate a unique request ID
 * @param {Object} config - Axios request config
 * @returns {string} - Unique request ID
 */
export const generateRequestId = (config) => {
    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url || '';
    const data = config.data ? JSON.stringify(config.data) : '';
    return `${method}_${url}_${btoa(data).slice(0, 8)}_${Date.now()}`;
};

/**
 * Check if a request should be retried (not a login/refresh request)
 * @param {Object} config - Axios request config
 * @returns {boolean} - True if request should be retried
 */
export const shouldRetryRequest = (config) => {
    const url = config.url || '';
    const method = config.method?.toUpperCase() || 'GET';
    
    // Don't retry login, refresh, or auth-related requests
    const skipPatterns = [
        '/auth/login',
        '/auth/refresh-token',
        '/user/login',
        '/user/refresh-token',
        '/user/verify-otp',
        '/user/create-user'
    ];
    
    return !skipPatterns.some(pattern => url.includes(pattern));
};
