'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaSpinner, FaCheck, FaSearch, FaShieldAlt, FaGithub, FaEnvelope, FaUser } from 'react-icons/fa'
import axios from 'axios'
import { API_KEY, getEffectiveApiUrl } from '../lib/api'

interface ScanProgressProps {
    scanId: string
    onComplete: (results: any) => void
    onError: () => void
    overrideApiUrl?: string
}

export default function ScanProgress({ scanId, onComplete, onError, overrideApiUrl }: ScanProgressProps) {
    const apiUrl = (overrideApiUrl || getEffectiveApiUrl()).replace(/\/$/, '')
    const [progress, setProgress] = useState(0)
    const [currentModule, setCurrentModule] = useState('Initializing…')
    const [completedModules, setCompletedModules] = useState<string[]>([])

    const modules = [
        { id: 'domain_intel', name: 'Domain Intelligence', icon: FaSearch },
        { id: 'tech_fingerprint', name: 'Tech Fingerprinting', icon: FaShieldAlt },
        { id: 'github_intel', name: 'GitHub OSINT', icon: FaGithub },
        { id: 'email_intel', name: 'Email Intelligence', icon: FaEnvelope },
        { id: 'username_intel', name: 'Username OSINT', icon: FaUser },
    ]

    useEffect(() => {
        let pollErrors = 0
        const MAX_POLL_ERRORS = 10

        const checkStatus = async () => {
            try {
                const response = await axios.get(
                    `${apiUrl}/api/v1/scan/${scanId}`,
                    { headers: { 'X-API-Key': API_KEY } }
                )

                const result = response.data
                pollErrors = 0

                if (result.status === 'completed') {
                    setProgress(100)
                    onComplete(result)
                } else if (result.status === 'failed') {
                    onError()
                } else {
                    const completed = result.modules_executed || []
                    setCompletedModules(completed)
                    const estimatedProgress = Math.min((completed.length / 5) * 100, 95)
                    setProgress(estimatedProgress)
                    if (completed.length > 0) {
                        setCurrentModule(`Processing ${completed[completed.length - 1]}…`)
                    }
                }
            } catch (error: any) {
                pollErrors++
                console.error(`Status check error (attempt ${pollErrors}):`, error)
                if (!error.response) {
                    setCurrentModule(`⚠️ Network error — retrying… (${pollErrors}/${MAX_POLL_ERRORS})`)
                }
                if (pollErrors >= MAX_POLL_ERRORS) {
                    console.error('Too many poll failures, aborting scan.')
                    onError()
                }
            }
        }

        const interval = setInterval(checkStatus, 2000)
        checkStatus()
        return () => clearInterval(interval)
    }, [scanId, apiUrl, onComplete, onError])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
        >
            <div className="glass p-8">
                <h2 className="text-lg font-bold text-cyber-cyan mb-6 flex items-center gap-3 tracking-wider uppercase">
                    <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 flex items-center justify-center">
                        <FaSpinner className="text-sm animate-spin" />
                    </div>
                    Reconnaissance In Progress
                </h2>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">Scan Progress</span>
                        <span className="text-sm text-cyber-cyan font-bold font-mono">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full relative"
                            style={{
                                background: 'linear-gradient(90deg, #00d9ff, #00ff41)',
                                boxShadow: '0 0 12px rgba(0, 217, 255, 0.4)',
                            }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                        </motion.div>
                    </div>
                    <p className="text-gray-500 text-[10px] mt-2 font-mono">{currentModule}</p>
                </div>

                {/* Module Status */}
                <div className="space-y-2">
                    <h3 className="text-[10px] text-gray-500 font-semibold mb-3 uppercase tracking-widest">OSINT Modules</h3>
                    {modules.map((module, idx) => {
                        const isCompleted = completedModules.includes(module.id)
                        const isActive = !isCompleted && completedModules.length === idx

                        return (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={`p-3.5 rounded-xl border transition-all duration-300 ${isCompleted
                                        ? 'border-cyber-green/20 bg-cyber-green/[0.03]'
                                        : isActive
                                            ? 'border-cyber-cyan/20 bg-cyber-cyan/[0.03]'
                                            : 'border-white/[0.04] bg-white/[0.01]'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-cyber-green/10' :
                                                isActive ? 'bg-cyber-cyan/10' :
                                                    'bg-white/[0.03]'
                                            }`}>
                                            <module.icon className={`text-sm ${isCompleted ? 'text-cyber-green' :
                                                    isActive ? 'text-cyber-cyan' :
                                                        'text-gray-700'
                                                }`} />
                                        </div>
                                        <span className={`text-sm font-medium ${isCompleted ? 'text-cyber-green' :
                                                isActive ? 'text-cyber-cyan' :
                                                    'text-gray-600'
                                            }`}>
                                            {module.name}
                                        </span>
                                    </div>
                                    <div>
                                        {isCompleted ? (
                                            <FaCheck className="text-cyber-green text-sm" />
                                        ) : isActive ? (
                                            <FaSpinner className="text-cyber-cyan text-sm animate-spin" />
                                        ) : (
                                            <div className="w-4 h-4 border border-gray-700 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Scan Info */}
                <div className="mt-6 pt-5 border-t border-white/[0.04]">
                    <div className="text-[10px] text-gray-600 space-y-1 font-mono">
                        <p>📡 Scan ID: <span className="text-cyber-cyan">{scanId}</span></p>
                        <p>⏱️ Estimated time: 15–30 seconds</p>
                        <p>🔒 All data collected from public sources only</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
