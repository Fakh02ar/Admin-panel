/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['fakhar.x2uzrja.mongodb.net'], // Add your MongoDB Atlas domain if needed
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
}

export default nextConfig
