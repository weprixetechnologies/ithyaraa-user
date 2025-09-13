/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'ithyaraa.com' },
            { protocol: 'http', hostname: '192.168.1.9' },
            { protocol: 'https', hostname: 'images.bewakoof.com' },
            { protocol: 'https', hostname: 'picsum.photos' },
            { protocol: 'https', hostname: 'ithyaraa.b-cdn.net' },
            { protocol: 'https', hostname: 'www.beyoung.in' }
        ],
    },
    // Optimize bundle splitting
    experimental: {
        optimizePackageImports: ['react-icons', 'react-spinners', 'react-toastify']
    },
    // Webpack configuration for better code splitting
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    // Vendor chunks
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        priority: 10,
                    },
                    // React icons chunk
                    reactIcons: {
                        test: /[\\/]node_modules[\\/]react-icons[\\/]/,
                        name: 'react-icons',
                        chunks: 'all',
                        priority: 20,
                    },
                    // UI components chunk
                    ui: {
                        test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
                        name: 'ui-components',
                        chunks: 'all',
                        priority: 15,
                    },
                    // Profile components chunk
                    profile: {
                        test: /[\\/]src[\\/]components[\\/]profile[\\/]/,
                        name: 'profile-components',
                        chunks: 'all',
                        priority: 15,
                    },
                    // Product components chunk
                    products: {
                        test: /[\\/]src[\\/]components[\\/]products[\\/]/,
                        name: 'product-components',
                        chunks: 'all',
                        priority: 15,
                    },
                    // Common chunk for shared code
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
};

export default nextConfig;
