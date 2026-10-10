import type { NextConfig } from "next";
import { COMPANY_IMAGE_HOSTS } from "./src/lib/company-images";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: COMPANY_IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname, port: "", pathname: "/**" })),
    minimumCacheTTL: 86400,
    maximumRedirects: 0,
  },
  async headers() {
    return [{
      source: "/brand-icons/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
      {
        source: "/health",
        destination: "http://localhost:8000/health",
      },
    ];
  },
};

export default nextConfig;
