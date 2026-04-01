import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Increase the body size limit for Server Actions (file uploads, large forms, etc.)
  // the default is 1mb, product creation can exceed that when sending images/base64
  // In Next 15 this setting must live under `experimental` so it's picked up.
  serverExternalPackages: [
    "@grandchef/node-printer",
    "@mapbox/node-pre-gyp",
    "node-thermal-printer",
  ],
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
            value: "https://zadfitt.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
