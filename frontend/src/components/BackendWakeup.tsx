'use client'

/**
 * BackendWakeup — handles Render free-tier cold starts.
 * Uses shared API utilities from lib/api.ts.
 */

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaServer, FaCheckCircle, FaExclamationTriangle, FaTimes, FaSync } from 'react-icons/fa'
import axios from 'axios'
import { getCandidateUrls } from '../lib/api'

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
    const [dismissed, setDismissed] = useState(false)

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

        setStatus(prev => prev === 'checking' ? 'waking' : prev)
        onStatusChange?.('waking')
        setAttempt(a => a + 1)
    }, [onStatusChange])

    useEffect(() => {
        if (status === 'online' || status === 'offline') return
        const t = setInterval(() => setElapsed(e => e + 1), 1000)
        return () => clearInterval(t)
    }, [status])

    useEffect(() => {
        if (elapsed >= MAX_WAIT_SECONDS && status !== 'online') {
            setStatus('offline')
            onStatusChange?.('offline')
        }
    }, [elapsed, status, onStatusChange])

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

    useEffect(() => {
        if (status === 'online') {
            const t = setTimeout(() => setDismissed(true), 5000)
            return () => clearTimeout(t)
        }
    }, [status])

    if (dismissed) return null
    if (status === 'checking') return null

    const cfg = {
        waking: {
            border: 'border-cyber-yellow/20', text: 'text-cyber-yellow',
            icon: <FaServer className="text-cyber-yellow animate-pulse" />,
            title: '⏳ Backend Waking Up…',
            body: `Pinging ${CANDIDATES.length} URLs (${elapsed}s / max ${MAX_WAIT_SECONDS}s). Scan will unlock automatically.`,
            progress: Math.min((elapsed / 60) * 100, 95),
            progressBg: 'bg-cyber-yellow/80',
        },
        online: {
            border: 'border-cyber-green/20', text: 'text-cyber-green',
            icon: <FaCheckCircle className="text-cyber-green" />,
            title: '✅ Backend Online',
            body: `Connected to ${workingUrl} in ${elapsed}s.`,
            progress: 100,
            progressBg: 'bg-cyber-green/80',
        },
        offline: {
            border: 'border-cyber-red/20', text: 'text-cyber-red',
            icon: <FaExclamationTriangle className="text-cyber-red" />,
            title: '❌ Backend Unreachable',
            body: `Tried ${CANDIDATES.length} URLs for ${elapsed}s — none responded.`,
            progress: 100,
            progressBg: 'bg-cyber-red/80',
        },
        checking: { border: '', text: '', icon: null, title: '', body: '', progress: 0, progressBg: '' },
    }[status]

    return (
        <AnimatePresence>
            <motion.div
                key="backend-banner"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className={`relative z-20 mx-auto max-w-4xl mt-4 glass-sm ${cfg.border} p-4`}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center gap-2 font-bold ${cfg.text} text-xs tracking-wide`}>
                        {cfg.icon}
                        {cfg.title}
                    </div>
                    <button onClick={() => setDismissed(true)} className="text-gray-700 hover:text-gray-400 transition-colors">
                        <FaTimes className="text-xs" />
                    </button>
                </div>

                <p className="text-gray-500 text-[10px] leading-relaxed mb-3">{cfg.body}</p>

                <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden mb-3">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cfg.progress}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full ${cfg.progressBg} rounded-full`}
                    />
                </div>

                {status === 'waking' && (
                    <div className="text-[10px] text-gray-700 space-y-0.5 mb-2">
                        <p className="text-gray-600 mb-1">Trying URLs (attempt #{attempt}):</p>
                        {CANDIDATES.map(url => (
                            <div key={url} className="flex items-center gap-2 font-mono">
                                <FaSync className="animate-spin text-cyber-yellow/50 text-[8px] shrink-0" />
                                <span>{url}/health</span>
                            </div>
                        ))}
                    </div>
                )}

                {status === 'offline' && (
                    <div className="mt-3 p-3 bg-black/30 rounded-xl border border-white/[0.04] text-[10px] space-y-2">
                        <p className="text-cyber-yellow font-bold uppercase tracking-wide">📋 How to fix:</p>
                        <ol className="text-gray-500 space-y-1 list-decimal list-inside">
                            <li>
                                Go to&nbsp;
                                <a href="https://dashboard.render.com" target="_blank" rel="noreferrer"
                                    className="text-cyber-cyan underline hover:text-white">
                                    dashboard.render.com
                                </a>
                                &nbsp;→ open <strong className="text-white">osint-backend</strong>.
                            </li>
                            <li>Check <strong className="text-white">Logs</strong> for errors.</li>
                            <li>
                                Set in frontend Environment:
                                <code className="block mt-1 bg-black/50 px-2 py-1 rounded text-cyber-cyan">
                                    NEXT_PUBLIC_API_URL = https://your-backend.onrender.com
                                </code>
                            </li>
                            <li>Trigger a manual redeploy.</li>
                        </ol>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
