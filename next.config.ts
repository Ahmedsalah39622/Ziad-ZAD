import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Increase the body size limit for Server Actions (file uploads, large forms, etc.)
  // the default is 1mb, product creation can exceed that when sending images/base64
  // In Next 15 this setting must live under `experimental` so it's picked up.
  experimental: {
    serverActions: {
      // increase to 10mb to avoid repeated 3mb/5mb errors
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
