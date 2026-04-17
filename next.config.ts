/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Image optimization configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'twrqlnyhbowrmoybmyfv.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: [
    '@radix-ui/react-id',
    '@radix-ui/react-use-callback-ref',
    '@radix-ui/react-select',
    '@radix-ui/react-use-layout-effect',
    '@radix-ui/react-use-previous',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/rapier',
    'three',
    'meshline'
  ],

  // Explicit root to avoid lockfile root mis-detection in multi-lockfile environments
  turbopack: {
    // Portable across machines/CI; resolves to repo root at runtime
    root: process.cwd(),
  },

  experimental: {
    proxyClientMaxBodySize: '20mb',
  },

  webpack: (config: any) => {
    config.module.rules.push({
      test: /\.glb$/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
