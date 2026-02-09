import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Clerk user avatars
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      // Convex file storage
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
      // Common image sources for moodboards
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
      },
    ],
  },
  // Skip type checking during build since Convex types need deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
