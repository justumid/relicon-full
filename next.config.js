/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true
  },
  env: {
    ENGINE_URL: process.env.ENGINE_URL || 'http://localhost:8000'
  },
  async rewrites() {
    return [
      {
        source: '/api/engine/:path*',
        destination: `${process.env.ENGINE_URL || 'http://localhost:8000'}/:path*`
      }
    ]
  }
}

module.exports = nextConfig
