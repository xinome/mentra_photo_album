import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React 19とNext.js 15.5の互換性向上
  reactStrictMode: true,
  // 画像最適化の設定
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
};

export default nextConfig;
