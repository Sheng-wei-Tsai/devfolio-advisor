import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["framer-motion", "@anthropic-ai/sdk", "@supabase/supabase-js"],
  },
};

export default nextConfig;
