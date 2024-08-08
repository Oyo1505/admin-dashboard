/** @type {import('next').NextConfig} */

const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();
 
const withVideos = require('next-videos');

const nextConfig = {
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname : 'fr.web.img6.acsta.net'
      },
      {
        protocol: 'https',
        hostname : 'media.senscritique.com'
      }
    ]
  }
};

module.exports = withNextIntl(withVideos(nextConfig));
