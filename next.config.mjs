/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
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
  webpack: (config, { isServer }) => {
    config.cache = {
      type: "memory",
    };

    // Exclude Node.js built-in modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        os: false,
        perf_hooks: false,
        cluster: false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },


};

export default nextConfig;
