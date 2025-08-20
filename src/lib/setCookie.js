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
    const { days, path = '/', secure, sameSite = 'strict' } = options;

    let cookieStr = `${name}=${encodeURIComponent(value)}; path=${path}; samesite=${sameSite}`;

    // Set secure only in prod or if explicitly provided
    const isProd = process.env.NODE_ENV === 'production';
    if (secure === true || (secure !== false && isProd)) {
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
