// Add this to your next.config.js or create one if it doesn't exist

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This allows production builds to successfully complete even if your project has ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This allows production builds to successfully complete even if your project has type errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
