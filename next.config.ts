import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Next.js 16/Turbopack found an unrelated package-lock.json in the
  // parent (home) directory and warned it might be inferring the wrong
  // workspace root. This project has no monorepo/workspace relationship
  // to that lockfile, so we pin the root explicitly instead of deleting
  // a file that may belong to something else. __dirname keeps this
  // portable across machines rather than hard-coding a Windows path.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
