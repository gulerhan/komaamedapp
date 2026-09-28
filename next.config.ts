import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    unoptimized: true,
    qualities: [100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ku',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
