/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',
    distDir: 'out',
    images: {
        unoptimized: true,
    },
    // ⚠️ Do NOT hardcode a fallback API URL here.
    // NEXT_PUBLIC_API_URL must be set as an environment variable in Render
    // (render.yaml already pulls it from the backend service URL automatically).
    // For local dev, set it in frontend/.env.local
}

module.exports = nextConfig
