import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server in .next/standalone for Azure App Service.
  output: "standalone",

  // Allow dev access from local network (e.g. testing on your phone via laptop IP)
  allowedDevOrigins: ["192.168.0.107", "localhost", "127.0.0.1"],
};

export default nextConfig;
