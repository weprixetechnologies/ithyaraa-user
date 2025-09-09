import { NextResponse } from "next/server";

export function middleware(req) {
    const url = req.nextUrl.clone();

    // Get the cookies
    const iilCookie = req.cookies.get("_iil")?.value === "true";
    const atCookie = req.cookies.get("_at")?.value;
    const rtCookie = req.cookies.get("_rt")?.value;

    // Protected routes
    const protectedRoutes = ["/profile"];

    // If user is not logged in or tokens missing, redirect
    if (
        protectedRoutes.some(route => url.pathname.startsWith(route)) &&
        (!iilCookie || !atCookie || !rtCookie)
    ) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile/:path*"],
};
