import { NextResponse } from "next/server";

export function middleware(req) {
    const url = req.nextUrl.clone();

    // Get the cookies
    const iilCookie = req.cookies.get("_iil")?.value === "true";
    const atCookie = req.cookies.get("_at")?.value;
    const rtCookie = req.cookies.get("_rt")?.value;

    // Check if user is authenticated
    const isAuthenticated = iilCookie && atCookie && rtCookie;

    // Protected routes that require authentication
    const protectedRoutes = [
        "/profile",
        "/cart",
        "/wishlist",
        "/orders",
        "/checkout"
    ];

    // Check if current path is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        url.pathname.startsWith(route)
    );

    // If accessing protected route without authentication
    if (isProtectedRoute && !isAuthenticated) {
        console.log('[Middleware] Redirecting to login from:', url.pathname);

        // Create login URL with redirect parameter
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', url.pathname + url.search);

        return NextResponse.redirect(loginUrl);
    }

    // If accessing login page while authenticated, redirect to home or intended page
    if (url.pathname === '/login' && isAuthenticated) {
        const redirectParam = url.searchParams.get('redirect');
        const redirectUrl = redirectParam || '/';

        console.log('[Middleware] User already authenticated, redirecting to:', redirectUrl);
        return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/profile/:path*',
        '/cart/:path*',
        '/wishlist/:path*',
        '/orders/:path*',
        '/checkout/:path*',
        '/make-combo/:path*',
        '/login'
    ],
};
