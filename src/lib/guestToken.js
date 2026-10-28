import { getCookie, setCookie } from './setCookie';

export const GUEST_TOKEN_COOKIE = '_guest_token';

/**
 * Retrieve existing anonymous guest token or create a new one persisted in a 30-day cookie
 */
export const getOrCreateGuestToken = () => {
    if (typeof window === 'undefined') return '';
    try {
        let token = getCookie(GUEST_TOKEN_COOKIE);
        if (!token) {
            token = `g_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;
            setCookie(GUEST_TOKEN_COOKIE, token, { days: 30 });
        }
        return token;
    } catch (e) {
        return '';
    }
};

/**
 * Clear guest token cookie (e.g. after merging into user account on login)
 */
export const clearGuestToken = () => {
    if (typeof window === 'undefined') return;
    try {
        document.cookie = `${GUEST_TOKEN_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    } catch (_) {}
};
