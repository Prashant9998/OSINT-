/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    distDir: 'out',
    images: {
        unoptimized: true,
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://osint-backend.onrender.com',
    },
}

module.exports = nextConfig
