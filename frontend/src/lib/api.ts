/**
 * Shared API configuration
 * Single source of truth for backend URL resolution and API key.
 */

export function getEffectiveApiUrl(): string {
    // 1. Prefer explicit env var set during build / .env.local
    if (process.env.NEXT_PUBLIC_API_URL) {
        let url = process.env.NEXT_PUBLIC_API_URL
        if (!url.startsWith('http')) url = `https://${url}`
        return url.replace(/\/$/, '')
    }

    // 2. Smart Discovery for Render deployments
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        if (hostname.includes('osint-frontend-') && hostname.endsWith('.onrender.com')) {
            return `https://${hostname.replace('osint-frontend-', 'osint-backend-')}`
        }
    }

    // 3. Local development fallback
    return 'http://localhost:8000'
}

// Read from env var first, then fall back to the default key
export const API_KEY =
    process.env.NEXT_PUBLIC_API_KEY || 'osint-recon-key-2026-change-this'

export const API_URL = getEffectiveApiUrl()

/**
 * Build a list of candidate backend URLs for health-check probing.
 * Used by BackendWakeup to find the correct backend when the env var
 * might point to a stale Render hostname.
 */
export function getCandidateUrls(): string[] {
    const candidates = new Set<string>()

    // 1. Env var
    if (process.env.NEXT_PUBLIC_API_URL) {
        let u = process.env.NEXT_PUBLIC_API_URL
        if (!u.startsWith('http')) u = `https://${u}`
        candidates.add(u.replace(/\/$/, ''))
    }

    if (typeof window !== 'undefined') {
        const host = window.location.hostname

        // 2. Smart mirror
        if (host.includes('osint-frontend-') && host.endsWith('.onrender.com')) {
            candidates.add(`https://${host.replace('osint-frontend-', 'osint-backend-')}`)
        }

        // 3. Common Render fallbacks
        if (host.endsWith('.onrender.com')) {
            candidates.add('https://osint-backend.onrender.com')
            candidates.add('https://osint-platform-api.onrender.com')
            candidates.add('https://osint-api.onrender.com')
        }
    }

    // 4. localhost for dev
    candidates.add('http://localhost:8000')

    return Array.from(candidates)
}
