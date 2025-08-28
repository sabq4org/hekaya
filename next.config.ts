import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', 'hekaya-ai.com']
  },
  serverExternalPackages: ['@prisma/client']
};

export default nextConfig;
