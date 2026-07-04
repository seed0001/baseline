import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep dev and production artifacts separate. Running `next build` while a
  // dev server is open can otherwise leave Turbopack reading mixed manifests.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // Keep Turbopack inside this checkout. A user-level lockfile otherwise makes
  // Next.js infer C:\Users\aztre as the workspace root.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
