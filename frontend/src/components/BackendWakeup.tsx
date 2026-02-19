'use client'

/**
 * BackendWakeup
 * ─────────────
 * Handles two distinct problems with Render free-tier:
 *
 *  1. COLD START  — backend sleeps after 15 min, takes 30–60 s to wake.
 *  2. WRONG URL   — NEXT_PUBLIC_API_URL may point to a dead URL if the
 *                   Render service was re-created and got a new hostname.
 *
 * Strategy:
 *  - Build a candidate list of backend URLs from multiple sources.
 *  - Ping ALL of them concurrently every 5 s.
 *  - Use the first one that responds.
 *  - Report the working URL to the parent so ScanForm uses it too.
 */

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaServer, FaCheckCircle, FaExclamationTriangle, FaTimes, FaSync } from 'react-icons/fa'
import axios from 'axios'

// ── Build candidate URL list ──────────────────────────────────────────────────
function getCandidateUrls(): string[] {
    const candidates = new Set<string>()

    // 1. Env var (injected by Render via fromService)
    if (process.env.NEXT_PUBLIC_API_URL) {
        let u = process.env.NEXT_PUBLIC_API_URL
        if (!u.startsWith('http')) u = `https://${u}`
        candidates.add(u.replace(/\/$/, ''))
    }

    if (typeof window !== 'undefined') {
        const host = window.location.hostname

        // 2. Smart mirror: osint-frontend-XXXX.onrender.com → osint-backend-XXXX.onrender.com
        if (host.includes('osint-frontend-') && host.endsWith('.onrender.com')) {
            candidates.add(`https://${host.replace('osint-frontend-', 'osint-backend-')}`)
        }

        // 3. Plain service name fallbacks on onrender.com
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

const CANDIDATES = getCandidateUrls()
const MAX_WAIT_SECONDS = 120

export type BackendState = 'checking' | 'waking' | 'online' | 'offline'

interface BackendWakeupProps {
    onStatusChange?: (status: BackendState, workingUrl?: string) => void
}

export default function BackendWakeup({ onStatusChange }: BackendWakeupProps) {
    const [status, setStatus] = useState<BackendState>('checking')
    const [elapsed, setElapsed] = useState(0)
    const [attempt, setAttempt] = useState(0)
    const [workingUrl, setWorkingUrl] = useState<string>('')
    const [triedUrls, setTriedUrls] = useState<string[]>([])
    const [dismissed, setDismissed] = useState(false)

    // Try all candidate URLs simultaneously — first to respond wins
    const checkAll = useCallback(async () => {
        const results = await Promise.allSettled(
            CANDIDATES.map(url =>
                axios.get(`${url}/health`, { timeout: 8000 }).then(() => url)
            )
        )

        for (const r of results) {
            if (r.status === 'fulfilled') {
                const url = r.value
                setWorkingUrl(url)
                setStatus('online')
                onStatusChange?.('online', url)
                return
            }
        }

        // All failed
        setTriedUrls(CANDIDATES)
        setStatus(prev => prev === 'checking' ? 'waking' : prev)
        onStatusChange?.('waking')
        setAttempt(a => a + 1)
    }, [onStatusChange])

    // Countdown
    useEffect(() => {
        if (status === 'online' || status === 'offline') return
        const t = setInterval(() => setElapsed(e => e + 1), 1000)
        return () => clearInterval(t)
    }, [status])

    // Give up after MAX_WAIT_SECONDS
    useEffect(() => {
        if (elapsed >= MAX_WAIT_SECONDS && status !== 'online') {
            setStatus('offline')
            onStatusChange?.('offline')
        }
    }, [elapsed, status, onStatusChange])

    // Poll every 5 s
    useEffect(() => {
        checkAll()
        const interval = setInterval(() => {
            if (status === 'online' || status === 'offline') {
                clearInterval(interval)
                return
            }
            checkAll()
        }, 5000)
        return () => clearInterval(interval)
    }, [checkAll, status])

    // Auto-dismiss 5 s after online
    useEffect(() => {
        if (status === 'online') {
            const t = setTimeout(() => setDismissed(true), 5000)
            return () => clearTimeout(t)
        }
    }, [status])

    if (dismissed) return null
    if (status === 'checking') return null

    // ── UI config per state ───────────────────────────────────────────────────
    const cfg = {
        waking: {
            border: 'border-cyber-yellow', bg: 'bg-cyber-yellow', text: 'text-cyber-yellow',
            icon: <FaServer className="text-cyber-yellow animate-pulse" />,
            title: '⏳ Backend Waking Up…',
            body: `Pinging ${CANDIDATES.length} possible backend URLs (${elapsed}s / max ${MAX_WAIT_SECONDS}s). Scan will unlock automatically once connected.`,
            progress: Math.min((elapsed / 60) * 100, 95),
        },
        online: {
            border: 'border-cyber-green', bg: 'bg-cyber-green', text: 'text-cyber-green',
            icon: <FaCheckCircle className="text-cyber-green" />,
            title: '✅ Backend Online',
            body: `Connected to ${workingUrl} in ${elapsed}s. You can now initiate scans.`,
            progress: 100,
        },
        offline: {
            border: 'border-cyber-red', bg: 'bg-cyber-red', text: 'text-cyber-red',
            icon: <FaExclamationTriangle className="text-cyber-red" />,
            title: '❌ Backend Unreachable',
            body: `Tried ${CANDIDATES.length} URLs for ${elapsed}s — none responded. See instructions below.`,
            progress: 100,
        },
        checking: { border: '', bg: '', text: '', icon: null, title: '', body: '', progress: 0 },
    }[status]

    return (
        <AnimatePresence>
            <motion.div
                key="backend-banner"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className={`relative z-20 mx-auto max-w-4xl mt-4 rounded-xl border ${cfg.border} border-opacity-40 bg-cyber-dark bg-opacity-90 backdrop-blur p-4`}
                style={{ boxShadow: '0 0 24px rgba(0,0,0,0.6)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center gap-2 font-bold ${cfg.text} text-sm tracking-wide`}>
                        {cfg.icon}
                        {cfg.title}
                    </div>
                    <button onClick={() => setDismissed(true)} className="text-gray-600 hover:text-gray-300 transition-colors">
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <p className="text-gray-400 text-xs leading-relaxed mb-3">{cfg.body}</p>

                {/* Progress bar */}
                <div className="h-1.5 bg-black bg-opacity-50 rounded-full overflow-hidden mb-3">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cfg.progress}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${cfg.bg} bg-opacity-80 rounded-full`}
                    />
                </div>

                {/* URL list while waking */}
                {status === 'waking' && (
                    <div className="text-xs text-gray-600 space-y-0.5 mb-2">
                        <p className="text-gray-500 mb-1">Trying these URLs (attempt #{attempt}):</p>
                        {CANDIDATES.map(url => (
                            <div key={url} className="flex items-center gap-2 font-mono">
                                <FaSync className="animate-spin text-cyber-yellow opacity-50 text-xs shrink-0" />
                                <span>{url}/health</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* OFFLINE — actionable instructions */}
                {status === 'offline' && (
                    <div className="mt-3 p-3 bg-black bg-opacity-40 rounded-lg border border-gray-700 text-xs space-y-2">
                        <p className="text-cyber-yellow font-bold uppercase tracking-wide">📋 How to fix:</p>
                        <ol className="text-gray-400 space-y-1 list-decimal list-inside">
                            <li>
                                Go to&nbsp;
                                <a href="https://dashboard.render.com" target="_blank" rel="noreferrer"
                                    className="text-cyber-cyan underline hover:text-white">
                                    dashboard.render.com
                                </a>
                                &nbsp;→ open your <strong className="text-white">osint-backend</strong> service.
                            </li>
                            <li>Check <strong className="text-white">Logs</strong> tab — look for build or runtime errors.</li>
                            <li>
                                Copy the backend URL from the top of the service page, then set it in Render's&nbsp;
                                <strong className="text-white">Environment</strong> tab for the frontend:
                                <code className="block mt-1 bg-black px-2 py-1 rounded text-cyber-cyan">
                                    NEXT_PUBLIC_API_URL = https://your-backend.onrender.com
                                </code>
                            </li>
                            <li>Trigger a manual redeploy of the frontend after saving the env var.</li>
                        </ol>
                        <p className="text-gray-600 mt-2">
                            URLs tried: {CANDIDATES.join(' · ')}
                        </p>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
