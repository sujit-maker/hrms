/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['192.168.29.225'],
  },
}

module.exports = nextConfig
