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
    }
};

export default nextConfig;
