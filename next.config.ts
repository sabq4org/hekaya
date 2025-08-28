import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Disabled for development with middleware
  // trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
