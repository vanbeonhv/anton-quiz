/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React StrictMode to prevent double API calls in development
  reactStrictMode: false,
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
