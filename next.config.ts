import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Increase the body size limit for Server Actions (file uploads, large forms, etc.)
  // the default is 1mb, product creation can exceed that when sending images/base64
  // In Next 15 this setting must live under `experimental` so it's picked up.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // increase to 10mb to avoid repeated 3mb/5mb errors
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.paddle.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https://sandbox-checkout.paddle.com https://checkout.paddle.com https://cdn.paddle.com; frame-src 'self' https://sandbox-checkout.paddle.com https://checkout.paddle.com; frame-ancestors 'self';",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://zadwearstore.vercel.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
