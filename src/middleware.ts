import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://cdn.paddle.com${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ""};
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https:;
        font-src 'self' data:;
        connect-src 'self' https://sandbox-checkout.paddle.com https://checkout.paddle.com https://cdn.paddle.com;
        frame-src 'self' https://sandbox-checkout.paddle.com https://checkout.paddle.com;
        frame-ancestors 'self';
        object-src 'none';
        base-uri 'self';
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, " ").trim();

    const requestHeaders = new Headers(request.headers);

    // Initial response configured with updated request headers
    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Only protect /admin routes (except /admin/login)
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
        // Check for the session token cookie
        const token =
            request.cookies.get("authjs.session-token")?.value ||
            request.cookies.get("__Secure-authjs.session-token")?.value;

        if (!token) {
            const loginUrl = new URL("/admin/login", request.url);
            response = NextResponse.redirect(loginUrl);
        }
    }

    // If already logged in and trying to access /admin/login, redirect to /admin
    if (pathname === "/admin/login") {
        const token =
            request.cookies.get("authjs.session-token")?.value ||
            request.cookies.get("__Secure-authjs.session-token")?.value;

        if (token) {
            const adminUrl = new URL("/admin", request.url);
            response = NextResponse.redirect(adminUrl);
        }
    }

    // Set CSP header on the response
    response.headers.set("Content-Security-Policy", cspHeader);

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};

