'use client'

/**
 * BackendWakeup
 * ─────────────
 * Render free-tier services spin down after ~15 min of inactivity.
 * The first request after sleep takes 30–60 s to wake up.
 *
 * This component:
 *  1. Pings /health every 3 s until the backend responds.
 *  2. Shows a dismissible banner with live countdown / status.
 *  3. Reports the backend status to the parent so it can disable the scan form.
 */

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaServer, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa'
import axios from 'axios'

// ── Reuse the same URL resolution as ScanForm / ScanProgress ─────────────────
const getEffectiveApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) {
        let url = process.env.NEXT_PUBLIC_API_URL
        if (!url.startsWith('http')) url = `https://${url}`
        return url.replace(/\/$/, '')
    }
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        if (hostname.includes('osint-frontend-') && hostname.endsWith('.onrender.com')) {
            return `https://${hostname.replace('osint-frontend-', 'osint-backend-')}`
        }
    }
    return 'http://localhost:8000'
}

const API_URL = getEffectiveApiUrl()
const HEALTH_URL = `${API_URL}/health`
const MAX_WAIT_SECONDS = 90   // give Render up to 90 s to cold-start

export type BackendState = 'checking' | 'waking' | 'online' | 'offline'

interface BackendWakeupProps {
    onStatusChange?: (status: BackendState) => void
}

export default function BackendWakeup({ onStatusChange }: BackendWakeupProps) {
    const [status, setStatus] = useState<BackendState>('checking')
    const [elapsed, setElapsed] = useState(0)
    const [attempt, setAttempt] = useState(0)
    const [dismissed, setDismissed] = useState(false)

    const check = useCallback(async () => {
        try {
            await axios.get(HEALTH_URL, { timeout: 8000 })
            setStatus('online')
            onStatusChange?.('online')
        } catch {
            setStatus(prev => prev === 'checking' ? 'waking' : prev)
            onStatusChange?.('waking')
        }
        setAttempt(a => a + 1)
    }, [onStatusChange])

    // Countdown timer
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

    // Poll /health every 3 s
    useEffect(() => {
        check()
        const interval = setInterval(() => {
            if (status === 'online' || status === 'offline') {
                clearInterval(interval)
                return
            }
            check()
        }, 3000)
        return () => clearInterval(interval)
    }, [check, status])

    // Auto-dismiss 4 s after coming online
    useEffect(() => {
        if (status === 'online') {
            const t = setTimeout(() => setDismissed(true), 4000)
            return () => clearTimeout(t)
        }
    }, [status])

    if (dismissed) return null

    // ── Don't show anything if already online on first check ─────────────────
    if (status === 'checking') return null

    const statusConfig = {
        waking: {
            icon: <FaServer className="text-cyber-yellow animate-pulse text-lg" />,
            color: 'border-cyber-yellow',
            bg: 'bg-cyber-yellow',
            text: 'text-cyber-yellow',
            title: '⏳ Backend Waking Up…',
            body: `Render free-tier service is starting (${elapsed}s / ~60s). Please wait — scan will work once online.`,
            progress: Math.min((elapsed / 60) * 100, 95),
        },
        online: {
            icon: <FaCheckCircle className="text-cyber-green text-lg" />,
            color: 'border-cyber-green',
            bg: 'bg-cyber-green',
            text: 'text-cyber-green',
            title: '✅ Backend Online',
            body: `Connected to ${API_URL} in ${elapsed}s. You can now initiate scans.`,
            progress: 100,
        },
        offline: {
            icon: <FaExclamationTriangle className="text-cyber-red text-lg" />,
            color: 'border-cyber-red',
            bg: 'bg-cyber-red',
            text: 'text-cyber-red',
            title: '❌ Backend Unreachable',
            body: `Could not reach ${API_URL} after ${elapsed}s. The backend service may be down or mis-configured.`,
            progress: 100,
        },
        checking: {
            icon: null, color: '', bg: '', text: '', title: '', body: '', progress: 0,
        },
    }

    const cfg = statusConfig[status]

    return (
        <AnimatePresence>
            <motion.div
                key="backend-banner"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`relative z-20 mx-auto max-w-4xl mt-4 rounded-xl border ${cfg.color} border-opacity-50 bg-cyber-dark bg-opacity-90 backdrop-blur p-4`}
                style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
            >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center gap-2 font-bold ${cfg.text} text-sm tracking-wide`}>
                        {cfg.icon}
                        {cfg.title}
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
                        title="Dismiss"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <p className="text-gray-400 text-xs leading-relaxed mb-3">{cfg.body}</p>

                {/* Progress bar */}
                <div className="h-1.5 bg-black bg-opacity-50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cfg.progress}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${cfg.bg} bg-opacity-80 rounded-full`}
                    />
                </div>

                {/* Attempt counter */}
                {status === 'waking' && (
                    <p className="text-gray-600 text-xs mt-1">
                        Ping attempt #{attempt} · next in 3 s · backend URL: {API_URL}
                    </p>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
