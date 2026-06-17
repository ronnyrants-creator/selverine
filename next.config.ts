import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [],
  },
  async rewrites() {
    return [
      { source: '/mentions-legales', destination: '/mentions-legales.html' },
      { source: '/confidentialite', destination: '/confidentialite.html' },
      { source: '/cgv', destination: '/cgv.html' },
      { source: '/livraison', destination: '/livraison.html' },
      { source: '/retours', destination: '/retours.html' },
      { source: '/merci', destination: '/merci.html' },
    ];
  },
};

export default config;
