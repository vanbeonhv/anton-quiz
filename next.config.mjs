/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // BẮT BUỘC cho Docker
  // Disable React StrictMode to prevent double API calls in development
  reactStrictMode: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;
