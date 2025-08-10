/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      unoptimized: true,
    },
    output: 'standalone',
    experimental: {
      // Skip API route analysis during build to prevent DB connection issues
      instrumentationHook: false,
    },
    // Skip static generation for API routes during build
    trailingSlash: false,
    generateBuildId: () => 'build',
  }
  
  export default nextConfig
