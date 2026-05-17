import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained server in .next/standalone for Azure App Service.
  output: "standalone",

  // Force Next's file tracer to include @swc/helpers in the standalone bundle.
  // pnpm's symlinked layout (even with hoisted node-linker) can cause the tracer
  // to miss this transitive dependency, leading to a runtime crash:
  //   "Cannot find module '@swc/helpers/_/_interop_require_default'"
  // Cover both layouts: flat (npm/pnpm hoisted) and pnpm's content-addressable store.
  outputFileTracingIncludes: {
    "*": [
      "./node_modules/@swc/helpers/**/*",
      "./node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers/**/*",
    ],
  },

  // Allow dev access from local network (e.g. testing on your phone via laptop IP)
  allowedDevOrigins: ["192.168.0.107", "localhost", "127.0.0.1"],
};

export default nextConfig;
