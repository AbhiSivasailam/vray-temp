import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/api/providers',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value:
            'Content-Type, x-vercel-protection-bypass, x-vercel-set-bypass-cookie',
        },
      ],
    },
  ],
};

export default nextConfig;
