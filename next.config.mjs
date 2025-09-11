/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // ✅ Ignore ESLint pendant le build Docker
  },
  reactStrictMode: true,
}

export default nextConfig;

