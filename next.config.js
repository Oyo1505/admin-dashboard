/** @type {import('next').NextConfig} */
// eslint-disable-next-line  @typescript-eslint/no-require-imports
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],

  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'fr.web.img6.acsta.net',
      },
      {
        protocol: 'https',
        hostname: 'media.senscritique.com',
      },
      {
        protocol: 'https',
        hostname: 'a.ltrbxd.com',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
