import type { NextConfig } from "next";

const backendDocsBase =
  process.env.CHECKOUT_API_URL ||
  process.env.CHECKOUT_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_CHECKOUT_API_BASE_URL ||
  "http://127.0.0.1:3001";

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
    if (process.env.NODE_ENV === "production") {
      return [];
    }

    return [
      // Proxy Swagger UI + assets from backend
      {
        source: "/docs",
        destination: `${backendDocsBase}/docs`,
      },
      {
        source: "/docs/:path*",
        destination: `${backendDocsBase}/docs/:path*`,
      },

      // (Optional) if your backend swagger is actually under /v1/docs:
      {
        source: "/v1/docs",
        destination: `${backendDocsBase}/v1/docs`,
      },
      {
        source: "/v1/docs/:path*",
        destination: `${backendDocsBase}/v1/docs/:path*`,
      },
    ];
  },
};

export default nextConfig; 
