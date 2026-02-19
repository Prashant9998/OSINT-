'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaSearch, FaGithub, FaEnvelope, FaUser, FaExclamationTriangle, FaSignOutAlt, FaServer } from 'react-icons/fa'
import ScanForm from '../components/ScanForm'
import ScanProgress from '../components/ScanProgress'
import ResultsDisplay from '../components/ResultsDisplay'
import AuthPage from '../components/AuthPage'
import BackendWakeup, { BackendState } from '../components/BackendWakeup'

export default function Home() {
    const [authenticated, setAuthenticated] = useState<boolean | null>(null)
    const [scanId, setScanId] = useState<string | null>(null)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'completed' | 'error'>('idle')
    const [scanResults, setScanResults] = useState<any>(null)
    const [backendStatus, setBackendStatus] = useState<BackendState>('checking')

    // Re-hydrate auth from sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem('osint_auth')
        setAuthenticated(saved === '1')
    }, [])

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

    // ── Hydration guard ──────────────────────────────────────────────────────
    if (authenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    // ── Auth gate ────────────────────────────────────────────────────────────
    if (!authenticated) {
        return <AuthPage onAuthenticated={handleAuthenticated} />
    }

    const backendOnline = backendStatus === 'online'
    const backendChecking = backendStatus === 'checking' || backendStatus === 'waking'

    // ── Main dashboard ───────────────────────────────────────────────────────
    return (
        <div className="min-h-screen relative overflow-x-hidden">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-grid opacity-20" style={{ backgroundSize: '50px 50px' }} />

            {/* Header */}
            <header className="relative z-10 border-b border-cyber-cyan border-opacity-30 bg-cyber-dark bg-opacity-80 backdrop-blur">
                <div className="container mx-auto px-4 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-4">
                            <FaShieldAlt className="text-4xl text-cyber-cyan animate-pulse-slow" />
                            <div>
                                <h1 className="text-3xl font-bold text-cyber-cyan glitch-text" data-text="OSINT RECON">
                                    OSINT RECON
                                </h1>
                                <p className="text-sm text-gray-400">Information Gathering Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Backend status pill */}
                            <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border ${backendStatus === 'online'
                                    ? 'border-cyber-green text-cyber-green bg-cyber-green bg-opacity-10'
                                    : backendStatus === 'offline'
                                        ? 'border-cyber-red text-cyber-red bg-cyber-red bg-opacity-10'
                                        : 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow bg-opacity-10'
                                }`}>
                                <FaServer className={backendChecking ? 'animate-pulse' : ''} />
                                <span>
                                    {backendStatus === 'online' ? 'BACKEND ONLINE' :
                                        backendStatus === 'offline' ? 'BACKEND OFFLINE' :
                                            backendStatus === 'waking' ? 'WAKING UP…' :
                                                'CHECKING…'}
                                </span>
                            </div>

                            {/* Logout */}
                            <button
                                id="logout-btn"
                                onClick={handleLogout}
                                title="Logout"
                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 border border-gray-700 rounded-lg hover:border-cyber-red hover:text-cyber-red transition-all duration-200"
                            >
                                <FaSignOutAlt />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Backend wake-up banner — shown below header */}
            <div className="container mx-auto px-4">
                <BackendWakeup onStatusChange={setBackendStatus} />
            </div>

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-8">

                {/* Ethical Disclaimer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 p-6 bg-cyber-red bg-opacity-10 border border-cyber-red rounded-lg neon-border-red"
                >
                    <div className="flex items-start space-x-4">
                        <FaExclamationTriangle className="text-3xl text-cyber-red flex-shrink-0 mt-1" />
                        <div>
                            <h2 className="text-xl font-bold text-cyber-red mb-2">⚠️ ETHICAL USE ONLY</h2>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                This platform performs <span className="text-cyber-cyan font-semibold">passive OSINT reconnaissance</span> using
                                only <span className="text-cyber-green">publicly available data</span>.
                                <span className="text-cyber-red font-semibold"> You must have explicit permission</span> to scan any target.
                                Unauthorized scanning may be illegal. This tool is for <span className="text-cyber-cyan">educational purposes</span> and
                                <span className="text-cyber-cyan"> authorized security assessments only</span>.
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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                    >
                        {[
                            { icon: FaSearch, title: 'Domain Intel', desc: 'WHOIS, DNS, Subdomains', color: 'cyber-cyan' },
                            { icon: FaShieldAlt, title: 'Tech Stack', desc: 'Fingerprinting, Security', color: 'cyber-green' },
                            { icon: FaGithub, title: 'GitHub OSINT', desc: 'Public Repos, Leaks', color: 'cyber-purple' },
                            { icon: FaEnvelope, title: 'Email Intel', desc: 'Validation, Breaches', color: 'cyber-yellow' },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                className={`p-6 bg-${feature.color} bg-opacity-5 border border-${feature.color} border-opacity-30 rounded-lg hover:border-opacity-60 transition-all duration-300 scanline`}
                            >
                                <feature.icon className={`text-4xl text-${feature.color} mb-3`} />
                                <h3 className={`text-lg font-bold text-${feature.color} mb-1`}>{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Scan Form — disabled with overlay while backend is starting */}
                {scanStatus === 'idle' && (
                    <div className="relative">
                        <ScanForm onScanInitiated={handleScanInitiated} onError={handleError} />

                        {/* Overlay while backend waking */}
                        {!backendOnline && backendStatus !== 'offline' && (
                            <div className="absolute inset-0 bg-cyber-darker bg-opacity-70 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-20 gap-3">
                                <div className="w-10 h-10 border-2 border-cyber-yellow border-t-transparent rounded-full animate-spin" />
                                <p className="text-cyber-yellow text-sm font-bold tracking-widest uppercase animate-pulse">
                                    Waiting for backend to wake up…
                                </p>
                                <p className="text-gray-500 text-xs">Render free-tier cold start — takes ~30–60 seconds</p>
                            </div>
                        )}

                        {/* Overlay when backend is offline */}
                        {backendStatus === 'offline' && (
                            <div className="absolute inset-0 bg-cyber-darker bg-opacity-80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-20 gap-3">
                                <FaExclamationTriangle className="text-4xl text-cyber-red" />
                                <p className="text-cyber-red text-sm font-bold tracking-widest uppercase">
                                    Backend Unreachable
                                </p>
                                <p className="text-gray-500 text-xs text-center max-w-xs">
                                    The backend did not respond. Check Render dashboard for service status.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Scan Progress */}
                {scanStatus === 'scanning' && scanId && (
                    <ScanProgress scanId={scanId} onComplete={handleScanComplete} onError={handleError} />
                )}

                {/* Results */}
                {scanStatus === 'completed' && scanResults && (
                    <ResultsDisplay results={scanResults} onNewScan={handleNewScan} />
                )}

                {/* Error State */}
                {scanStatus === 'error' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-8 bg-cyber-red bg-opacity-10 border border-cyber-red rounded-lg text-center"
                    >
                        <FaExclamationTriangle className="text-6xl text-cyber-red mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-cyber-red mb-2">Scan Failed</h2>
                        <p className="text-gray-300 mb-4">An error occurred during the scan. Please try again.</p>
                        <button
                            onClick={handleNewScan}
                            className="px-6 py-3 bg-cyber-cyan text-cyber-dark font-bold rounded hover:bg-opacity-80 transition-all"
                        >
                            New Scan
                        </button>
                    </motion.div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-cyber-cyan border-opacity-30 bg-cyber-dark bg-opacity-80 backdrop-blur mt-16">
                <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
                    <p>OSINT Reconnaissance Platform v1.0 | Built for Ethical Hacking &amp; Security Research</p>
                    <p className="mt-2 text-xs">
                        Always obtain proper authorization before conducting reconnaissance activities.
                    </p>
                </div>
            </footer>
        </div>
    )
}
