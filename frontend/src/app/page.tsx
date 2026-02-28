'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaShieldAlt, FaSearch, FaGithub, FaEnvelope, FaUser, FaGlobe, FaPhone,
    FaExclamationTriangle, FaSignOutAlt, FaBolt, FaCrosshairs, FaFingerprint,
    FaNetworkWired
} from 'react-icons/fa'
import ScanForm from '../components/ScanForm'
import ScanProgress from '../components/ScanProgress'
import ResultsDisplay from '../components/ResultsDisplay'
import AuthPage from '../components/AuthPage'
import BackendWakeup, { BackendState } from '../components/BackendWakeup'
import ParticleBackground from '../components/ParticleBackground'

const FEATURES = [
    { icon: FaGlobe, title: 'Domain Intel', desc: 'WHOIS · DNS · Subdomains · SSL', gradient: 'from-cyan-400 to-blue-500' },
    { icon: FaFingerprint, title: 'Tech Stack', desc: 'Fingerprinting · Security Headers', gradient: 'from-green-400 to-emerald-500' },
    { icon: FaGithub, title: 'GitHub OSINT', desc: 'Code Leaks · Public Repos', gradient: 'from-purple-400 to-violet-500' },
    { icon: FaEnvelope, title: 'Email Intel', desc: 'Breaches · MX · Validation', gradient: 'from-amber-400 to-orange-500' },
    { icon: FaNetworkWired, title: 'Full Recon', desc: 'All Modules · Deep Analysis', gradient: 'from-rose-400 to-pink-500' },
]

export default function Home() {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null)
    const [scanId, setScanId] = useState<string | null>(null)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'completed' | 'error'>('idle')
    const [scanResults, setScanResults] = useState<any>(null)
    const [backendStatus, setBackendStatus] = useState<BackendState>('checking')
    const [confirmedApiUrl, setConfirmedApiUrl] = useState<string | undefined>(undefined)

    useEffect(() => {
        const saved = sessionStorage.getItem('osint_auth')
        setAuthenticated(saved === '1')
    }, [])

    const handleBackendStatus = (status: BackendState, workingUrl?: string) => {
        setBackendStatus(status)
        if (workingUrl) setConfirmedApiUrl(workingUrl)
    }

    const handleAuthenticated = () => setAuthenticated(true)
    const handleLogout = () => {
        sessionStorage.removeItem('osint_auth')
        setAuthenticated(false)
        setScanId(null)
        setScanStatus('idle')
        setScanResults(null)
    }
    const handleScanInitiated = (id: string) => { setScanId(id); setScanStatus('scanning') }
    const handleScanComplete = (results: any) => { setScanResults(results); setScanStatus('completed') }
    const handleError = () => setScanStatus('error')
    const handleNewScan = () => { setScanId(null); setScanStatus('idle'); setScanResults(null) }

    if (authenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(5,7,15)]">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-cyber-cyan/30 border-t-cyber-cyan animate-spin" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-cyber-purple/20 border-b-cyber-purple animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
            </div>
        )
    }

    if (!authenticated) return <AuthPage onAuthenticated={handleAuthenticated} />

    const backendOnline = backendStatus === 'online'

    return (
        <div className="min-h-screen relative">
            <ParticleBackground />

            {/* Ambient mesh gradient blobs */}
            <div className="fixed inset-0 pointer-events-none z-[1]">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyber-cyan/[0.02] blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-cyber-purple/[0.03] blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
                <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyber-green/[0.015] blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
            </div>

            {/* Header */}
            <header className="relative z-20 border-b border-white/[0.04] bg-[rgba(5,7,15,0.7)] backdrop-blur-2xl sticky top-0">
                <div className="max-w-7xl mx-auto px-6 py-3.5">
                    <div className="flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="relative pulse-ring rounded-xl">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyan-600 flex items-center justify-center">
                                    <FaShieldAlt className="text-lg text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-base font-bold tracking-[0.15em] text-glow glitch-text" data-text="OSINT RECON">
                                    OSINT RECON
                                </h1>
                                <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-medium">Intelligence Platform</p>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                            {/* Status */}
                            <div className={`flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-full border backdrop-blur-sm ${backendStatus === 'online'
                                    ? 'border-cyber-green/20 text-cyber-green bg-cyber-green/[0.04]'
                                    : backendStatus === 'offline'
                                        ? 'border-cyber-red/20 text-cyber-red bg-cyber-red/[0.04]'
                                        : 'border-cyber-yellow/20 text-cyber-yellow bg-cyber-yellow/[0.04]'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-cyber-green shadow-[0_0_6px_rgba(0,255,65,0.5)]' :
                                        backendStatus === 'offline' ? 'bg-cyber-red' :
                                            'bg-cyber-yellow animate-pulse'
                                    }`} />
                                <span className="uppercase tracking-wider">
                                    {backendStatus === 'online' ? 'Online' :
                                        backendStatus === 'offline' ? 'Offline' :
                                            backendStatus === 'waking' ? 'Waking…' : 'Checking…'}
                                </span>
                            </div>

                            <button
                                id="logout-btn"
                                onClick={handleLogout}
                                className="btn-ghost flex items-center gap-1.5 !py-1.5 !px-3 !text-[10px]"
                            >
                                <FaSignOutAlt className="text-[9px]" />
                                Exit
                            </button>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Backend wake-up */}
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <BackendWakeup onStatusChange={handleBackendStatus} />
            </div>

            {/* Main */}
            <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">

                {/* Ethical Notice */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-10 glass-sm border-cyber-red/10 p-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyber-red/10 flex items-center justify-center shrink-0">
                            <FaExclamationTriangle className="text-xs text-cyber-red" />
                        </div>
                        <p className="text-[11px] text-white/40 leading-relaxed">
                            <span className="text-cyber-red font-semibold">Ethical Use Only</span> — Passive OSINT using public data.
                            You must have <span className="text-white/60">explicit permission</span> to scan any target.
                        </p>
                    </div>
                </motion.div>

                {/* Hero Feature Grid */}
                <AnimatePresence>
                    {scanStatus === 'idle' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: 0.2 }}
                            className="mb-10"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="text-center mb-8"
                            >
                                <h2 className="text-3xl font-bold text-glow mb-2 tracking-wide">
                                    Intelligence Gathering
                                </h2>
                                <p className="text-white/25 text-sm max-w-lg mx-auto">
                                    Advanced reconnaissance modules powered by public data sources and free APIs
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {FEATURES.map((f, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 + i * 0.06 }}
                                        className="group"
                                    >
                                        <div className="glass-sm glass-interactive p-4 h-full cursor-default">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}
                                                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                                            >
                                                <f.icon className="text-white text-sm" />
                                            </div>
                                            <h3 className="text-xs font-bold text-white/80 mb-1">{f.title}</h3>
                                            <p className="text-[10px] text-white/25 leading-relaxed">{f.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scan Form */}
                {scanStatus === 'idle' && (
                    <div className="relative">
                        <ScanForm
                            onScanInitiated={handleScanInitiated}
                            onError={handleError}
                            overrideApiUrl={confirmedApiUrl}
                        />
                        {!backendOnline && backendStatus !== 'offline' && (
                            <div className="absolute inset-0 bg-[rgba(5,7,15,0.8)] backdrop-blur-sm rounded-[20px] flex flex-col items-center justify-center z-20 gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-2 border-cyber-yellow/30 border-t-cyber-yellow animate-spin" />
                                </div>
                                <div className="text-center">
                                    <p className="text-cyber-yellow text-xs font-bold tracking-widest uppercase mb-1">Connecting…</p>
                                    <p className="text-white/20 text-[10px]">Cold start takes ~30–60s</p>
                                </div>
                            </div>
                        )}
                        {backendStatus === 'offline' && (
                            <div className="absolute inset-0 bg-[rgba(5,7,15,0.9)] backdrop-blur-sm rounded-[20px] flex flex-col items-center justify-center z-20 gap-4">
                                <div className="w-14 h-14 rounded-full bg-cyber-red/10 flex items-center justify-center">
                                    <FaExclamationTriangle className="text-xl text-cyber-red" />
                                </div>
                                <p className="text-cyber-red text-xs font-bold tracking-widest uppercase">Backend Unreachable</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Progress */}
                {scanStatus === 'scanning' && scanId && (
                    <ScanProgress scanId={scanId} onComplete={handleScanComplete} onError={handleError} overrideApiUrl={confirmedApiUrl} />
                )}

                {/* Results */}
                {scanStatus === 'completed' && scanResults && (
                    <ResultsDisplay results={scanResults} onNewScan={handleNewScan} overrideApiUrl={confirmedApiUrl} />
                )}

                {/* Error */}
                <AnimatePresence>
                    {scanStatus === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass shimmer-border p-12 text-center max-w-md mx-auto"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-cyber-red/10 flex items-center justify-center mx-auto mb-6">
                                <FaExclamationTriangle className="text-3xl text-cyber-red" />
                            </div>
                            <h2 className="text-xl font-bold text-cyber-red mb-2">Scan Failed</h2>
                            <p className="text-white/30 text-sm mb-8">An error occurred. Please try again.</p>
                            <button onClick={handleNewScan} className="btn-primary">
                                <FaBolt className="inline mr-2" /> Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.03] mt-20">
                <div className="max-w-5xl mx-auto px-6 py-8 text-center">
                    <p className="text-white/15 text-[11px]">OSINT Recon v1.0 · Ethical Hacking & Security Research</p>
                    <p className="mt-1 text-[10px] text-white/10">
                        Always obtain authorization before reconnaissance.
                    </p>
                </div>
            </footer>
        </div>
    )
}
