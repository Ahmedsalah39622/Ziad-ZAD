import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes (except /admin/login)
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
        // Check for the session token cookie
        const token =
            request.cookies.get("authjs.session-token")?.value ||
            request.cookies.get("__Secure-authjs.session-token")?.value;

        if (!token) {
            const loginUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // If already logged in and trying to access /admin/login, redirect to /admin
    if (pathname === "/admin/login") {
        const token =
            request.cookies.get("authjs.session-token")?.value ||
            request.cookies.get("__Secure-authjs.session-token")?.value;

        if (token) {
            const adminUrl = new URL("/admin", request.url);
            return NextResponse.redirect(adminUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
