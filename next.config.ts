import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Skip type checking during build since Convex types need deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
