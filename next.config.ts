import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for better performance
  output: 'standalone',
  images: {
    unoptimized: false, // Enable image optimization on Vercel
    domains: ['hekaya-ai.com', 'localhost']
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
};

export default nextConfig;
