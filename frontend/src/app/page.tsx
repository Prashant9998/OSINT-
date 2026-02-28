'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaShieldAlt, FaSearch, FaGithub, FaEnvelope, FaUser, FaGlobe, FaPhone,
    FaExclamationTriangle, FaSignOutAlt, FaServer, FaBolt
} from 'react-icons/fa'
import ScanForm from '../components/ScanForm'
import ScanProgress from '../components/ScanProgress'
import ResultsDisplay from '../components/ResultsDisplay'
import AuthPage from '../components/AuthPage'
import BackendWakeup, { BackendState } from '../components/BackendWakeup'

const FEATURES = [
    { icon: FaGlobe, title: 'Domain Intel', desc: 'WHOIS, DNS, Subdomains & More', color: 'cyber-cyan' as const },
    { icon: FaShieldAlt, title: 'Tech Stack', desc: 'Fingerprinting & Security Headers', color: 'cyber-green' as const },
    { icon: FaGithub, title: 'GitHub OSINT', desc: 'Public Repos & Code Leaks', color: 'cyber-purple' as const },
    { icon: FaEnvelope, title: 'Email Intel', desc: 'Breach Check & Validation', color: 'cyber-yellow' as const },
    { icon: FaUser, title: 'Username Hunt', desc: 'Cross-Platform Presence', color: 'cyber-cyan' as const },
]

const COLOR_MAP = {
    'cyber-cyan': { bg: 'bg-cyber-cyan/5', border: 'border-cyber-cyan/30', hoverBorder: 'hover:border-cyber-cyan/60', text: 'text-cyber-cyan', iconBg: 'bg-cyber-cyan/10' },
    'cyber-green': { bg: 'bg-cyber-green/5', border: 'border-cyber-green/30', hoverBorder: 'hover:border-cyber-green/60', text: 'text-cyber-green', iconBg: 'bg-cyber-green/10' },
    'cyber-purple': { bg: 'bg-cyber-purple/5', border: 'border-cyber-purple/30', hoverBorder: 'hover:border-cyber-purple/60', text: 'text-cyber-purple', iconBg: 'bg-cyber-purple/10' },
    'cyber-yellow': { bg: 'bg-cyber-yellow/5', border: 'border-cyber-yellow/30', hoverBorder: 'hover:border-cyber-yellow/60', text: 'text-cyber-yellow', iconBg: 'bg-cyber-yellow/10' },
} as const

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

    const handleScanInitiated = (id: string) => {
        setScanId(id)
        setScanStatus('scanning')
    }

    const handleScanComplete = (results: any) => {
        setScanResults(results)
        setScanStatus('completed')
    }

    const handleError = () => setScanStatus('error')

    const handleNewScan = () => {
        setScanId(null)
        setScanStatus('idle')
        setScanResults(null)
    }

    // Hydration guard
    if (authenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!authenticated) {
        return <AuthPage onAuthenticated={handleAuthenticated} />
    }

    const backendOnline = backendStatus === 'online'
    const backendChecking = backendStatus === 'checking' || backendStatus === 'waking'

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-grid opacity-15" style={{ backgroundSize: '50px 50px' }} />

            {/* Ambient glow blobs */}
            <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-cyber-cyan/[0.03] blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyber-purple/[0.03] blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 border-b border-white/[0.06] bg-cyber-darker/80 backdrop-blur-xl sticky top-0">
                <div className="container mx-auto px-6 py-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <FaShieldAlt className="text-3xl text-cyber-cyan" />
                                <div className="absolute inset-0 text-3xl text-cyber-cyan blur-md opacity-40"><FaShieldAlt /></div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-wider text-gradient-cyan glitch-text" data-text="OSINT RECON">
                                    OSINT RECON
                                </h1>
                                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Intelligence Gathering Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Backend status pill */}
                            <div className={`flex items-center gap-2 text-[10px] font-mono px-3 py-1.5 rounded-full border backdrop-blur-sm ${backendStatus === 'online'
                                    ? 'border-cyber-green/40 text-cyber-green bg-cyber-green/5'
                                    : backendStatus === 'offline'
                                        ? 'border-cyber-red/40 text-cyber-red bg-cyber-red/5'
                                        : 'border-cyber-yellow/40 text-cyber-yellow bg-cyber-yellow/5'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === 'online' ? 'bg-cyber-green animate-pulse' :
                                        backendStatus === 'offline' ? 'bg-cyber-red' :
                                            'bg-cyber-yellow animate-pulse'
                                    }`} />
                                <span className="uppercase tracking-wider">
                                    {backendStatus === 'online' ? 'Online' :
                                        backendStatus === 'offline' ? 'Offline' :
                                            backendStatus === 'waking' ? 'Waking…' :
                                                'Checking…'}
                                </span>
                            </div>

                            {/* Logout */}
                            <button
                                id="logout-btn"
                                onClick={handleLogout}
                                title="Logout"
                                className="flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 border border-white/[0.06] rounded-lg hover:border-cyber-red/40 hover:text-cyber-red transition-all duration-200 bg-white/[0.02]"
                            >
                                <FaSignOutAlt className="text-xs" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Backend wake-up banner */}
            <div className="container mx-auto px-6">
                <BackendWakeup onStatusChange={handleBackendStatus} />
            </div>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-6 py-8">

                {/* Ethical Disclaimer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 p-5 glass-sm border-cyber-red/20 bg-cyber-red/[0.03]"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-cyber-red/10 shrink-0">
                            <FaExclamationTriangle className="text-lg text-cyber-red" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-cyber-red mb-1 uppercase tracking-wider">⚠️ Ethical Use Only</h2>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                This platform performs <span className="text-cyber-cyan font-medium">passive OSINT reconnaissance</span> using
                                only <span className="text-cyber-green">publicly available data</span>.
                                <span className="text-cyber-red font-medium"> You must have explicit permission</span> to scan any target.
                                For <span className="text-cyber-cyan">educational purposes</span> and
                                <span className="text-cyber-cyan"> authorized assessments only</span>.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Features Overview */}
                {scanStatus === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8"
                    >
                        {FEATURES.map((feature, idx) => {
                            const c = COLOR_MAP[feature.color]
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 + idx * 0.07 }}
                                    className={`p-4 glass-sm ${c.border} ${c.hoverBorder} glass-hover group cursor-default`}
                                >
                                    <div className={`w-9 h-9 rounded-lg ${c.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className={`text-base ${c.text}`} />
                                    </div>
                                    <h3 className={`text-sm font-semibold ${c.text} mb-0.5`}>{feature.title}</h3>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}

                {/* Scan Form — disabled with overlay while backend is starting */}
                {scanStatus === 'idle' && (
                    <div className="relative">
                        <ScanForm
                            onScanInitiated={handleScanInitiated}
                            onError={handleError}
                            overrideApiUrl={confirmedApiUrl}
                        />

                        {/* Overlay while backend waking */}
                        {!backendOnline && backendStatus !== 'offline' && (
                            <div className="absolute inset-0 bg-cyber-darker/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20 gap-3">
                                <div className="w-10 h-10 border-2 border-cyber-yellow border-t-transparent rounded-full animate-spin" />
                                <p className="text-cyber-yellow text-xs font-bold tracking-widest uppercase animate-pulse">
                                    Waiting for backend…
                                </p>
                                <p className="text-gray-600 text-[10px]">Cold start takes ~30–60 seconds</p>
                            </div>
                        )}

                        {/* Overlay when backend is offline */}
                        {backendStatus === 'offline' && (
                            <div className="absolute inset-0 bg-cyber-darker/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20 gap-3">
                                <FaExclamationTriangle className="text-3xl text-cyber-red" />
                                <p className="text-cyber-red text-xs font-bold tracking-widest uppercase">
                                    Backend Unreachable
                                </p>
                                <p className="text-gray-600 text-[10px] text-center max-w-xs">
                                    Check Render dashboard for service status.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Scan Progress */}
                {scanStatus === 'scanning' && scanId && (
                    <ScanProgress
                        scanId={scanId}
                        onComplete={handleScanComplete}
                        onError={handleError}
                        overrideApiUrl={confirmedApiUrl}
                    />
                )}

                {/* Results */}
                {scanStatus === 'completed' && scanResults && (
                    <ResultsDisplay results={scanResults} onNewScan={handleNewScan} overrideApiUrl={confirmedApiUrl} />
                )}

                {/* Error State */}
                <AnimatePresence>
                    {scanStatus === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass p-10 text-center max-w-lg mx-auto"
                        >
                            <div className="w-16 h-16 rounded-full bg-cyber-red/10 flex items-center justify-center mx-auto mb-5">
                                <FaExclamationTriangle className="text-3xl text-cyber-red" />
                            </div>
                            <h2 className="text-xl font-bold text-cyber-red mb-2">Scan Failed</h2>
                            <p className="text-gray-400 text-sm mb-6">An error occurred during the scan. Please try again.</p>
                            <button
                                onClick={handleNewScan}
                                className="px-6 py-3 bg-cyber-cyan text-cyber-dark font-bold rounded-xl hover:bg-cyber-cyan/90 transition-all duration-200 text-sm tracking-wider uppercase glow-cyan"
                            >
                                <FaBolt className="inline mr-2" />
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/[0.04] bg-cyber-darker/60 backdrop-blur-sm mt-16">
                <div className="container mx-auto px-6 py-6 text-center">
                    <p className="text-gray-500 text-xs">OSINT Reconnaissance Platform v1.0 · Ethical Hacking & Security Research</p>
                    <p className="mt-1.5 text-[10px] text-gray-600">
                        Always obtain proper authorization before conducting reconnaissance.
                    </p>
                </div>
            </footer>
        </div>
    )
}
