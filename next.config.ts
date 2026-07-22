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
  // Multi-zones: serve the Creative Audit magnet (separate Vercel project,
  // basePath '/ImageADsGuide') under this domain at monotising.com/ImageADsGuide.
  async rewrites() {
    const creativeAudit = 'https://creative-audit-three.vercel.app';
    return [
      { source: '/ImageADsGuide', destination: `${creativeAudit}/ImageADsGuide` },
      { source: '/ImageADsGuide/:path*', destination: `${creativeAudit}/ImageADsGuide/:path*` },
    ];
  },
};

export default nextConfig;
