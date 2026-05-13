import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/MedspaADsRoadmap',
        permanent: false, // 307 temporary redirect
      },
    ];
  },
};

export default nextConfig;
