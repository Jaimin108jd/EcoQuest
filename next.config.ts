import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '9qxatspjxwwdnywd.public.blob.vercel-storage.com',
      },
    ],
  },
}

export default nextConfig