import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: path.resolve(__dirname),
  experimental: {
    // Force project root to prevent Next.js from picking up an orphan package-lock.json in ancestor directories
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
