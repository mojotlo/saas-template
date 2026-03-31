import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Images from Clerk (user avatars)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
}

export default nextConfig
