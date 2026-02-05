"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, setCookieEasy } from '@/lib/setCookie';
import {
    getAndClearRedirectUrl,
    getAndClearPendingRequests,
    clearAllRedirectData
} from '@/lib/redirectUtils';
import axiosInstance from '@/lib/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    // Check authentication status
    const checkAuthStatus = () => {
        const accessToken = getCookie('_at');
        const refreshToken = getCookie('_rt');
        const isLoggedIn = getCookie('_iil');

        const authenticated = !!(accessToken && refreshToken && isLoggedIn === 'true');
        setIsAuthenticated(authenticated);
        setIsLoading(false);

        return authenticated;
    };

    // Handle successful login
    const handleLoginSuccess = async (redirectFromUrl = null) => {
        setIsAuthenticated(true);
        setIsLoading(false);

        // Get stored redirect URL or use URL parameter
        const storedRedirectUrl = getAndClearRedirectUrl();
        const redirectUrl = redirectFromUrl || storedRedirectUrl;

        // Get pending requests
        const pendingRequests = getAndClearPendingRequests();

        console.log('[AuthContext] Login successful');
        console.log('[AuthContext] Redirect URL:', redirectUrl);
        console.log('[AuthContext] Pending requests:', pendingRequests.length);

        // Retry pending requests
        if (pendingRequests.length > 0) {
            console.log('[AuthContext] Retrying pending requests...');
            await retryPendingRequests(pendingRequests);
        }

        // Redirect to stored URL or home
        if (redirectUrl) {
            console.log('[AuthContext] Redirecting to stored URL:', redirectUrl);
            router.push(redirectUrl);
        } else {
            console.log('[AuthContext] Redirecting to home');
            router.push('/');
        }
    };

    // Retry pending requests
    const retryPendingRequests = async (pendingRequests) => {
        const retryPromises = pendingRequests.map(async (request) => {
            try {
                console.log('[AuthContext] Retrying request:', request.id);
                const response = await axiosInstance(request.config);
                console.log('[AuthContext] Request retry successful:', request.id);
                return { success: true, requestId: request.id, response };
            } catch (error) {
                console.error('[AuthContext] Request retry failed:', request.id, error);
                return { success: false, requestId: request.id, error };
            }
        });

        const results = await Promise.allSettled(retryPromises);

        // Log results
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const { success, requestId } = result.value;
                console.log(`[AuthContext] Request ${requestId}: ${success ? 'SUCCESS' : 'FAILED'}`);
            } else {
                console.error(`[AuthContext] Request ${index} promise rejected:`, result.reason);
            }
        });
    };

    // Handle logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        clearAllRedirectData();

        // Clear cookies
        document.cookie = '_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = '_rt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'newsletter_joined=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        router.push('/');
    };

    // Fetch user details
    const fetchUserDetails = async () => {
        if (!isAuthenticated) return;

        try {
            const response = await axiosInstance.get('/user/detail-by-user');
            setUser(response.data);

            // Persist newsletter_joined flag in a cookie for optimization
            const joined = response.data?.newsletter_joined;
            if (joined === 1 || joined === true) {
                setCookieEasy('newsletter_joined', 'true', 30);
            } else if (joined === 0 || joined === false) {
                setCookieEasy('newsletter_joined', 'false', 30);
            }
        } catch (error) {
            console.error('[AuthContext] Error fetching user details:', error);
            if (error.response?.status === 401) {
                handleLogout();
            }
        }
    };

    // Initialize auth status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Fetch user details when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserDetails();
        }
    }, [isAuthenticated]);

    const value = {
        isAuthenticated,
        isLoading,
        user,
        checkAuthStatus,
        handleLoginSuccess,
        handleLogout,
        fetchUserDetails
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
