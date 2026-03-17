import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
    ],
  },
  async rewrites() {
    return [
      // Proxy Swagger UI + assets from backend
      {
        source: "/docs",
        destination: "http://127.0.0.1:3001/docs",
      },
      {
        source: "/docs/:path*",
        destination: "http://127.0.0.1:3001/docs/:path*",
      },

      // (Optional) if your backend swagger is actually under /v1/docs:
      {
        source: "/v1/docs",
        destination: "http://127.0.0.1:3001/v1/docs",
      },
      {
        source: "/v1/docs/:path*",
        destination: "http://127.0.0.1:3001/v1/docs/:path*",
      },
    ];
  },
};

export default nextConfig; 
