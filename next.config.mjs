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
    // Skip static generation for API routes during build
    trailingSlash: false,
    generateBuildId: () => 'build',
  }
  
  export default nextConfig
