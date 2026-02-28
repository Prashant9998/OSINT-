'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaSpinner, FaCheck, FaSearch, FaShieldAlt, FaGithub, FaEnvelope, FaUser, FaCrosshairs } from 'react-icons/fa'
import axios from 'axios'
import { API_KEY, getEffectiveApiUrl } from '../lib/api'

interface ScanProgressProps {
    scanId: string
    onComplete: (results: any) => void
    onError: () => void
    overrideApiUrl?: string
}

const MODULES = [
    { id: 'domain_intel', name: 'Domain Intelligence', icon: FaSearch, gradient: 'from-cyan-400 to-blue-500' },
    { id: 'tech_fingerprint', name: 'Tech Fingerprinting', icon: FaShieldAlt, gradient: 'from-green-400 to-emerald-500' },
    { id: 'github_intel', name: 'GitHub OSINT', icon: FaGithub, gradient: 'from-purple-400 to-violet-500' },
    { id: 'email_intel', name: 'Email Intelligence', icon: FaEnvelope, gradient: 'from-amber-400 to-orange-500' },
    { id: 'username_intel', name: 'Username OSINT', icon: FaUser, gradient: 'from-rose-400 to-pink-500' },
]

export default function ScanProgress({ scanId, onComplete, onError, overrideApiUrl }: ScanProgressProps) {
    const apiUrl = (overrideApiUrl || getEffectiveApiUrl()).replace(/\/$/, '')
    const [progress, setProgress] = useState(0)
    const [currentModule, setCurrentModule] = useState('Initializing modules…')
    const [completedModules, setCompletedModules] = useState<string[]>([])

    useEffect(() => {
        let pollErrors = 0
        const MAX_POLL_ERRORS = 10

        const checkStatus = async () => {
            try {
                const res = await axios.get(`${apiUrl}/api/v1/scan/${scanId}`, {
                    headers: { 'X-API-Key': API_KEY },
                })
                pollErrors = 0
                if (res.data.status === 'completed') { setProgress(100); onComplete(res.data) }
                else if (res.data.status === 'failed') onError()
                else {
                    const done = res.data.modules_executed || []
                    setCompletedModules(done)
                    setProgress(Math.min((done.length / 5) * 100, 95))
                    if (done.length > 0) setCurrentModule(`Processing ${done[done.length - 1]}…`)
                }
            } catch (err: any) {
                pollErrors++
                if (!err.response) setCurrentModule(`⚠️ Retrying… (${pollErrors}/${MAX_POLL_ERRORS})`)
                if (pollErrors >= MAX_POLL_ERRORS) onError()
            }
        }

        const interval = setInterval(checkStatus, 2000)
        checkStatus()
        return () => clearInterval(interval)
    }, [scanId, apiUrl, onComplete, onError])

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <div className="glass shimmer-border p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyan-600 flex items-center justify-center shadow-[0_4px_20px_rgba(0,217,255,0.15)]">
                            <FaCrosshairs className="text-white text-sm animate-pulse" />
                        </div>
                        <div className="absolute inset-0 w-10 h-10 rounded-xl border-2 border-cyber-cyan/30 animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-glow tracking-wider">SCANNING TARGET</h2>
                        <p className="text-[10px] text-white/20 uppercase tracking-wider">reconnaissance in progress</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">Progress</span>
                        <span className="text-lg font-bold text-glow font-mono">{Math.round(progress)}%</span>
                    </div>

                    <div className="relative h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/[0.04]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="absolute inset-y-0 left-0 rounded-full"
                            style={{
                                background: 'linear-gradient(90deg, #00d9ff, #00ff41, #8b5cf6)',
                                boxShadow: '0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(0, 217, 255, 0.1)',
                            }}
                        />
                        {/* Animated shimmer on bar */}
                        <motion.div
                            animate={{ x: ['0%', '200%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{ width: `${progress}%`, maxWidth: '100%' }}
                        />
                    </div>

                    <p className="text-white/20 text-[10px] mt-2 font-mono">{currentModule}</p>
                </div>

                {/* Module Grid */}
                <div className="space-y-2">
                    <h3 className="text-[10px] text-white/15 uppercase tracking-[0.2em] mb-3 font-medium">OSINT Modules</h3>
                    {MODULES.map((mod, idx) => {
                        const done = completedModules.includes(mod.id)
                        const active = !done && completedModules.length === idx

                        return (
                            <motion.div
                                key={mod.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ${done
                                        ? 'border-cyber-green/10 bg-cyber-green/[0.02]'
                                        : active
                                            ? 'border-cyber-cyan/10 bg-cyber-cyan/[0.02]'
                                            : 'border-white/[0.03] bg-white/[0.005]'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center transition-all duration-500 ${done ? 'opacity-100 shadow-lg' : active ? 'opacity-80 animate-pulse' : 'opacity-20'
                                        }`}>
                                        <mod.icon className="text-white text-xs" />
                                    </div>
                                    <span className={`text-sm font-medium transition-colors duration-300 ${done ? 'text-cyber-green' : active ? 'text-white/70' : 'text-white/20'
                                        }`}>
                                        {mod.name}
                                    </span>
                                </div>
                                <div>
                                    {done ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full bg-cyber-green/15 flex items-center justify-center"
                                        >
                                            <FaCheck className="text-cyber-green text-[10px]" />
                                        </motion.div>
                                    ) : active ? (
                                        <div className="relative w-6 h-6 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border border-white/[0.06]" />
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Scan Info */}
                <div className="mt-8 pt-5 border-t border-white/[0.03]">
                    <div className="text-[10px] text-white/15 space-y-1.5 font-mono">
                        <p>📡 ID: <span className="text-cyber-cyan/50">{scanId}</span></p>
                        <p>⏱️ Est. 15–30 seconds</p>
                        <p>🔒 Public data sources only</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
