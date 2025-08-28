import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'hekaya-ai.com']
  },
  serverExternalPackages: ['@prisma/client']
};

export default nextConfig;
