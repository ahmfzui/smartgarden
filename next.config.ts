import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  // Enable standalone output for Docker - PENTING!
  output: 'standalone',
  // Experimental optimizations
  experimental: {
    // Remove this if causing issues
    optimizePackageImports: ['framer-motion', 'lucide-react']
  },
  // Disable image optimization for simpler deployment
  images: {
    unoptimized: true
  }
};

export default nextConfig;