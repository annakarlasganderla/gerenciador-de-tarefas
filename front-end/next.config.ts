import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The back-end is a workspace package published as plain TypeScript
  // (no build step); Next.js compiles it together with the front-end.
  transpilePackages: ["@task-manager/back-end"],
  // Monorepo root, so Next.js can trace dependencies outside front-end/.
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
