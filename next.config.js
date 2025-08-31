/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static generation to avoid Firebase init during build
  experimental: {
    staticWorkerRequestDeduping: false,
  }
}

module.exports = nextConfig
