import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
            },
            {
                protocol: 'https',
                hostname: 'logo.clearbit.com',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'loremflickr.com',
            },
            {
                protocol: 'https',
                hostname: '*.loremflickr.com',
            },
        ],
    },
    // Exclude canvaskit-wasm from server-side bundling to avoid fs module errors
    serverExternalPackages: ['canvaskit-wasm'],
    // Empty turbopack config to silence Next.js 16 warning about webpack config
    turbopack: {},
    webpack: (config, { isServer }) => {
        // Stub out fs and path for client-side builds
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
            };
        }
        return config;
    },
};

export default nextConfig;
