/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,        // Helps avoid hydration issues
  swcMinify: true,
  
  // Important for Vercel + Wagmi apps
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },

  // Allow static export (helps with some build issues)
  output: 'export',
  trailingSlash: true,

  images: {
    unoptimized: true,   // Important for static export
  },
};

module.exports = nextConfig;
