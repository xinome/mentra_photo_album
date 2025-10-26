/** @type {import('next').NextConfig} */
const nextConfig = {
  // React 18とNext.js 13の互換性向上
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

module.exports = nextConfig;
