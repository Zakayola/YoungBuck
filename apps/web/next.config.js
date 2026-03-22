/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@zakayola/ui', '@zakayola/sdk', '@zakayola/utils'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    NEXT_PUBLIC_HORIZON_URL: process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org',
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet',
    NEXT_PUBLIC_SOROBAN_CONTRACT_ID: process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID || '',
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent Node.js-only Stellar SDK modules from being bundled for the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      config.externals = [
        ...(config.externals || []),
        'sodium-native',
        'require-addon',
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
