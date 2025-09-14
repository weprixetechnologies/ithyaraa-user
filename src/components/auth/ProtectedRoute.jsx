"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { storeRedirectUrl, isProtectedRoute } from '@/lib/redirectUtils';
import Loading from '@/components/ui/loading';

const ProtectedRoute = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated && isProtectedRoute(pathname)) {
            console.log('[ProtectedRoute] User not authenticated, storing redirect URL and redirecting to login');
            storeRedirectUrl(pathname);
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    if (isLoading) {
        return <Loading />;
    }

    // If not authenticated and it's a protected route, don't render children
    if (!isAuthenticated && isProtectedRoute(pathname)) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
