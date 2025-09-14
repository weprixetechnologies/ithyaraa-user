"use client";

import { useAuthActions } from './useAuthActions';

export const useApiActions = () => {
    const { requireAuth } = useAuthActions();

    // Wrapper for API calls that require authentication
    const withAuth = (apiCall) => {
        return requireAuth(async (...args) => {
            try {
                const result = await apiCall(...args);
                return result;
            } catch (error) {
                console.error('API call failed:', error);
                throw error;
            }
        });
    };

    return {
        withAuth
    };
};
