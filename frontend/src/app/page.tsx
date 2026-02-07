'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaShieldAlt, FaSearch, FaGithub, FaEnvelope, FaUser, FaExclamationTriangle } from 'react-icons/fa'
import ScanForm from '@/components/ScanForm'
import ScanProgress from '@/components/ScanProgress'
import ResultsDisplay from '@/components/ResultsDisplay'

export default function Home() {
    const [scanId, setScanId] = useState<string | null>(null)
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'completed' | 'error'>('idle')
    const [scanResults, setScanResults] = useState<any>(null)

    const handleScanInitiated = (id: string) => {
        setScanId(id)
        setScanStatus('scanning')
    }

    const handleScanComplete = (results: any) => {
        setScanResults(results)
        setScanStatus('completed')
    }

    const handleError = () => {
        setScanStatus('error')
    }

    const handleNewScan = () => {
        setScanId(null)
        setScanStatus('idle')
        setScanResults(null)
    }

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            {/* Background Grid */}
            <div className="fixed inset-0 bg-grid opacity-20" style={{ backgroundSize: '50px 50px' }}></div>

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
                        <div className="flex items-center space-x-2 text-cyber-green text-sm">
                            <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                            <span>SYSTEM OPERATIONAL</span>
                        </div>
                    </motion.div>
                </div>
            </header>

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

                {/* Scan Form */}
                {scanStatus === 'idle' && (
                    <ScanForm onScanInitiated={handleScanInitiated} onError={handleError} />
                )}

                {/* Scan Progress */}
                {scanStatus === 'scanning' && scanId && (
                    <ScanProgress
                        scanId={scanId}
                        onComplete={handleScanComplete}
                        onError={handleError}
                    />
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
                    <p>OSINT Reconnaissance Platform v1.0 | Built for Ethical Hacking & Security Research</p>
                    <p className="mt-2 text-xs">
                        Always obtain proper authorization before conducting reconnaissance activities.
                    </p>
                </div>
            </footer>
        </div>
    )
}
