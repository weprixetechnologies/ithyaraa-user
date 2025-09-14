"use client";

import { useRouter } from 'next/navigation';
import { storeRedirectUrl, isProtectedRoute } from '@/lib/redirectUtils';
import { getCookie } from '@/lib/setCookie';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthActions = () => {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const checkAuthAndRedirect = (action) => {
        if (!isAuthenticated) {
            // Store current URL for redirect after login
            const currentUrl = window.location.pathname + window.location.search;
            storeRedirectUrl(currentUrl);
            
            // Redirect to login
            router.push('/login');
            return false;
        }
        return true;
    };

    const requireAuth = (callback) => {
        return (...args) => {
            if (checkAuthAndRedirect()) {
                return callback(...args);
            }
        };
    };

    const requireAuthForPage = () => {
        if (!isAuthenticated && isProtectedRoute(window.location.pathname)) {
            const currentUrl = window.location.pathname + window.location.search;
            storeRedirectUrl(currentUrl);
            router.push('/login');
            return false;
        }
        return true;
    };

    return {
        checkAuthAndRedirect,
        requireAuth,
        requireAuthForPage
    };
};
