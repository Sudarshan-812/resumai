import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 👇 This line is critical for pdf-parse to work
  serverExternalPackages: ["pdf-parse"], 
};

export default nextConfig;