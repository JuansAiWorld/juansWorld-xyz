import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/flowpace',
        destination: '/flowpace/index.html',
      },
    ];
  },
};

export default nextConfig;
