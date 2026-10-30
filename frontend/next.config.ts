import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['127.0.0.1'],
  turbopack: { root: process.cwd() },
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${process.env.API_PROXY_TARGET ?? 'https://cosmeticsbackend.app.aletcloud.com/backend/api'}/:path*`,
      },
    ];
  },
};
export default nextConfig;
