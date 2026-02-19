'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaSpinner, FaCheck, FaSearch, FaShieldAlt, FaGithub, FaEnvelope, FaUser } from 'react-icons/fa'
import axios from 'axios'

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
// ⚠️  Must match API_KEY in backend/.env
const API_KEY = 'osint-recon-key-2026-change-this'

interface ScanProgressProps {
    scanId: string
    onComplete: (results: any) => void
    onError: () => void
}

export default function ScanProgress({ scanId, onComplete, onError }: ScanProgressProps) {
    const [progress, setProgress] = useState(0)
    const [currentModule, setCurrentModule] = useState('Initializing...')
    const [completedModules, setCompletedModules] = useState<string[]>([])

    const modules = [
        { id: 'domain_intel', name: 'Domain Intelligence', icon: FaSearch },
        { id: 'tech_fingerprint', name: 'Tech Stack Fingerprinting', icon: FaShieldAlt },
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
                    `${API_URL}/api/v1/scan/${scanId}`,
                    {
                        headers: { 'X-API-Key': API_KEY },
                    }
                )

                const result = response.data
                pollErrors = 0   // reset on success

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
                        setCurrentModule(`Processing ${completed[completed.length - 1]}...`)
                    }
                }
            } catch (error: any) {
                pollErrors++
                console.error(`Status check error (attempt ${pollErrors}):`, error)
                if (!error.response) {
                    setCurrentModule(`⚠️ Network error — retrying... (${pollErrors}/${MAX_POLL_ERRORS})`)
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
    }, [scanId, onComplete, onError])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
        >
            <div className="p-8 bg-cyber-dark border border-cyber-cyan rounded-lg neon-border scanline">
                <h2 className="text-2xl font-bold text-cyber-cyan mb-6 flex items-center">
                    <FaSpinner className="mr-3 animate-spin" />
                    RECONNAISSANCE IN PROGRESS
                </h2>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-cyber-green text-sm font-semibold">SCAN PROGRESS</span>
                        <span className="text-cyber-cyan font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-4 bg-black bg-opacity-60 rounded-full overflow-hidden border border-cyber-cyan border-opacity-30">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-green neon-border-green relative"
                        >
                            <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse"></div>
                        </motion.div>
                    </div>
                    <p className="text-gray-400 text-xs mt-2 terminal">{currentModule}</p>
                </div>

                {/* Module Status */}
                <div className="space-y-3">
                    <h3 className="text-cyber-green text-sm font-semibold mb-3">OSINT MODULES</h3>
                    {modules.map((module, idx) => {
                        const isCompleted = completedModules.includes(module.id)
                        const isActive = !isCompleted && completedModules.length === idx

                        return (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`p-4 rounded-lg border transition-all duration-300 ${isCompleted
                                    ? 'border-cyber-green bg-cyber-green bg-opacity-10'
                                    : isActive
                                        ? 'border-cyber-cyan bg-cyber-cyan bg-opacity-10 animate-pulse'
                                        : 'border-gray-700 bg-black bg-opacity-40'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <module.icon
                                            className={`text-2xl ${isCompleted
                                                ? 'text-cyber-green'
                                                : isActive
                                                    ? 'text-cyber-cyan'
                                                    : 'text-gray-600'
                                                }`}
                                        />
                                        <span
                                            className={`font-semibold ${isCompleted
                                                ? 'text-cyber-green'
                                                : isActive
                                                    ? 'text-cyber-cyan'
                                                    : 'text-gray-500'
                                                }`}
                                        >
                                            {module.name}
                                        </span>
                                    </div>
                                    <div>
                                        {isCompleted ? (
                                            <FaCheck className="text-cyber-green text-xl" />
                                        ) : isActive ? (
                                            <FaSpinner className="text-cyber-cyan text-xl animate-spin" />
                                        ) : (
                                            <div className="w-5 h-5 border-2 border-gray-600 rounded-full"></div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Scan Info */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>📡 Scan ID: <span className="text-cyber-cyan font-mono">{scanId}</span></p>
                        <p>⏱️ Estimated time: 15-30 seconds</p>
                        <p>🔒 All data collected is from public sources only</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
