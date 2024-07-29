/** @type {import('next').NextConfig} */
const withVideos = require('next-videos')
const nextConfig = {
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
      }
    
    ]
  }
};

module.exports = withVideos(nextConfig);
