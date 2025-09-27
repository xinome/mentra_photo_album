import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Turbopackの実験的な設定
      rules: {
        // カスタムローダールールがあればここに追加
      },
    },
  },
  // React 19とNext.js 15.5の互換性向上
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
