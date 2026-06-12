import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Render deployment
  output: "standalone",

  // Headers for PWA
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [{ key: "Content-Type", value: "application/manifest+json" }],
      },
    ];
  },
};

export default nextConfig;
