/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: false,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'ithyaraa.com' },
            { protocol: 'http', hostname: '192.168.1.9' },
            { protocol: 'https', hostname: 'images.bewakoof.com' },
            { protocol: 'https', hostname: 'picsum.photos' },
            { protocol: 'https', hostname: 'ithyaraa.b-cdn.net' },
            { protocol: 'https', hostname: 'www.beyoung.in' }
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    },
    experimental: {
        optimizePackageImports: ['react-icons', 'react-spinners', 'react-toastify']
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        priority: 10,
                    },
                    reactIcons: {
                        test: /[\\/]node_modules[\\/]react-icons[\\/]/,
                        name: 'react-icons',
                        chunks: 'all',
                        priority: 20,
                    },
                    ui: {
                        test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
                        name: 'ui-components',
                        chunks: 'all',
                        priority: 15,
                    },
                    profile: {
                        test: /[\\/]src[\\/]components[\\/]profile[\\/]/,
                        name: 'profile-components',
                        chunks: 'all',
                        priority: 15,
                    },
                    products: {
                        test: /[\\/]src[\\/]components[\\/]products[\\/]/,
                        name: 'product-components',
                        chunks: 'all',
                        priority: 15,
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'all',
                        priority: 5,
                        reuseExistingChunk: true,
                    },
                },
            };
        }
        return config;
    },
    async rewrites() {
        return [
            {
                source: '/affiliate',
                destination: '/profile?tab=applyaffiliate',
            },
        ];
    },
};

export default nextConfig;