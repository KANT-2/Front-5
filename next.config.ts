import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // 예전 정적 bowl match 주소는 앱 안의 /match 로 보낸다.
  async redirects() {
    return [
      { source: "/bowl-match", destination: "/match", permanent: true },
      { source: "/bowl-match/:path*", destination: "/match", permanent: true },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
