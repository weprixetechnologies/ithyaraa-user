// utils/cookies.js

/**
 * Sets a cookie with proper options.
 * @param {string} name - Cookie name
 * @param {string|boolean|number} value - Cookie value
 * @param {Object} options - Optional settings
 * @param {number} options.days - Expiry in days (default: session cookie)
 * @param {string} options.path - Cookie path (default: '/')
 * @param {boolean} options.secure - Secure flag (default: true in prod)
 * @param {string} options.sameSite - SameSite policy (default: 'strict')
 */
export const setCookie = (name, value, options = {}) => {
    const { days, path = '/', secure, sameSite = 'lax' } = options;

    // Detect if we're on HTTPS (production) or HTTP (192.168.1.12)
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';

    let cookieStr = `${name}=${encodeURIComponent(value)}; path=${path}; samesite=${sameSite}`;

    // Set secure flag for HTTPS
    if (secure === true || (secure !== false && isSecure)) {
        cookieStr += '; secure';
    }

    // Set expiry if days provided
    if (days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        cookieStr += `; expires=${expires.toUTCString()}`;
    }

    document.cookie = cookieStr;
};

/**
 * Example usage:
 * setCookie('_at', accessToken, { days: 7 });
 * setCookie('_iil', true); // boolean values are encoded automatically
 */


// utils/cookies.js
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}


export const setCookieEasy = (name, value, days) => {
    const expires = days
        ? "; expires=" + new Date(Date.now() + days * 864e5).toUTCString()
        : "";

    // Detect if we're on HTTPS (production) or HTTP (192.168.1.12)
    const isSecure = window.location.protocol === 'https:';

    // Set Secure flag only on HTTPS, use Lax for cross-site requests
    document.cookie =
        name +
        "=" +
        encodeURIComponent(value) +
        expires +
        "; path=/" +
        (isSecure ? "; Secure" : "") +
        "; SameSite=Lax"; // Lax allows cookies to work across redirects but still provides CSRF protection
};
