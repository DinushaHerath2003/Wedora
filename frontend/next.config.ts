import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.56.1'],
};

export default nextConfig;
