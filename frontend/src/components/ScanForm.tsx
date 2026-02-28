'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaEnvelope, FaUser, FaGlobe, FaPhone, FaBolt, FaExclamationCircle } from 'react-icons/fa'
import axios from 'axios'
import { API_KEY, getEffectiveApiUrl } from '../lib/api'

interface ScanFormProps {
    onScanInitiated: (scanId: string) => void
    onError: () => void
    overrideApiUrl?: string
}

export default function ScanForm({ onScanInitiated, onError, overrideApiUrl }: ScanFormProps) {
    const effectiveUrl = (overrideApiUrl || getEffectiveApiUrl()).replace(/\/$/, '')
    const [target, setTarget] = useState('')
    const [scanType, setScanType] = useState<'domain' | 'email' | 'username' | 'phone' | 'full'>('domain')
    const [deepScan, setDeepScan] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!target.trim()) {
            setError('Please enter a target')
            return
        }

        setLoading(true)

        // Frontend Validation
        if (scanType === 'domain' || scanType === 'full') {
            const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
            const cleaned = target.replace('http://', '').replace('https://', '').split('/')[0]
            if (!target.includes('.') || !domainRegex.test(cleaned)) {
                setError('Invalid domain. Please enter a valid domain name (e.g., google.com).')
                setLoading(false)
                return
            }
        } else if (scanType === 'email') {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!emailRegex.test(target)) {
                setError('Invalid email address format.')
                setLoading(false)
                return
            }
        } else if (scanType === 'phone') {
            const phoneRegex = /^\+?[0-9\s-]{7,20}$/
            if (!phoneRegex.test(target)) {
                setError('Invalid phone number. Use digits, spaces, hyphens, optional +.')
                setLoading(false)
                return
            }
        }

        try {
            const response = await axios.post(
                `${effectiveUrl}/api/v1/scan`,
                {
                    target: target.trim(),
                    scan_type: scanType,
                    deep_scan: deepScan,
                },
                {
                    headers: {
                        'X-API-Key': API_KEY,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (response.data.scan_id) {
                onScanInitiated(response.data.scan_id)
            } else {
                throw new Error('No scan ID received')
            }
        } catch (err: any) {
            console.error('Scan initiation error:', err)

            if (!err.response) {
                setError(`Cannot reach the backend at ${effectiveUrl}. Make sure it's running.`)
            } else if (err.response.status === 401 || err.response.status === 403) {
                setError(`Authentication failed (${err.response.status}). API key mismatch.`)
            } else if (err.response.status === 429) {
                setError('Rate limit exceeded. Please wait a minute.')
            } else if (err.response.status === 400) {
                setError(err.response.data?.detail || 'Invalid target or scan parameters.')
            } else {
                setError(err.response.data?.detail || err.message)
            }
            onError()
        } finally {
            setLoading(false)
        }
    }

    const scanTypes = [
        { value: 'domain', label: 'Domain', icon: FaGlobe, description: 'WHOIS, DNS, Subdomains' },
        { value: 'email', label: 'Email', icon: FaEnvelope, description: 'MX, Breaches, Validation' },
        { value: 'username', label: 'Username', icon: FaUser, description: 'Platform Search' },
        { value: 'phone', label: 'Phone', icon: FaPhone, description: 'Carrier, Location' },
        { value: 'full', label: 'Full Scan', icon: FaSearch, description: 'All Modules' },
    ]

    const placeholders: Record<string, string> = {
        domain: 'example.com',
        email: 'user@example.com',
        username: 'johndoe',
        phone: '+1234567890',
        full: 'example.com',
    }

    const targetLabels: Record<string, string> = {
        domain: '(Domain)',
        email: '(Email Address)',
        username: '(Username)',
        phone: '(Phone Number)',
        full: '(Domain)',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <div className="glass p-8">
                <h2 className="text-lg font-bold text-cyber-cyan mb-6 flex items-center gap-3 tracking-wider uppercase">
                    <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 flex items-center justify-center">
                        <FaSearch className="text-sm" />
                    </div>
                    Initiate Reconnaissance
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Scan Type Selection */}
                    <div>
                        <label className="block text-[10px] text-gray-500 font-semibold mb-3 uppercase tracking-widest">
                            Select Scan Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {scanTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => { setScanType(type.value as any); setError('') }}
                                    className={`p-3 rounded-xl border transition-all duration-300 text-left group ${scanType === type.value
                                        ? 'border-cyber-cyan/40 bg-cyber-cyan/5 glow-cyan'
                                        : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.04]'
                                        }`}
                                >
                                    <type.icon className={`text-lg mb-2 ${scanType === type.value ? 'text-cyber-cyan' : 'text-gray-600 group-hover:text-gray-400'} transition-colors`} />
                                    <div className={`text-xs font-bold mb-0.5 ${scanType === type.value ? 'text-cyber-cyan' : 'text-gray-400'}`}>
                                        {type.label}
                                    </div>
                                    <div className="text-[10px] text-gray-600">{type.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Input */}
                    <div>
                        <label className="block text-[10px] text-gray-500 font-semibold mb-2 uppercase tracking-widest">
                            Target {targetLabels[scanType]}
                        </label>
                        <input
                            type="text"
                            value={target}
                            onChange={(e) => { setTarget(e.target.value); setError('') }}
                            placeholder={placeholders[scanType]}
                            className="w-full px-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-cyber-green placeholder-gray-600 focus:outline-none focus:border-cyber-cyan/40 focus:ring-1 focus:ring-cyber-cyan/20 transition-all font-mono text-sm"
                            required
                        />
                        <p className="mt-2 text-[10px] text-gray-600">
                            ⚠️ Ensure you have permission to scan this target
                        </p>
                    </div>

                    {/* Deep Scan Option */}
                    <label htmlFor="deepScan" className="flex items-center gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-all">
                        <input
                            type="checkbox"
                            id="deepScan"
                            checked={deepScan}
                            onChange={(e) => setDeepScan(e.target.checked)}
                            className="w-4 h-4 accent-cyber-cyan rounded"
                        />
                        <div>
                            <span className="text-xs font-semibold text-cyber-cyan">Enable Deep Scan</span>
                            <span className="block text-[10px] text-gray-600 mt-0.5">
                                More thorough analysis — slower, more API calls
                            </span>
                        </div>
                    </label>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2 p-3 bg-cyber-red/5 border border-cyber-red/20 rounded-xl text-cyber-red text-xs"
                        >
                            <FaExclamationCircle className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.01 }}
                        whileTap={{ scale: loading ? 1 : 0.99 }}
                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 ${loading
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/[0.06]'
                            : 'bg-gradient-to-r from-cyber-cyan to-cyan-400 text-cyber-dark hover:brightness-110 glow-cyan'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                                Initializing Scan…
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <FaBolt />
                                Initiate Scan
                            </span>
                        )}
                    </motion.button>
                </form>

                {/* Info Footer */}
                <div className="mt-6 pt-5 border-t border-white/[0.04]">
                    <div className="flex flex-wrap justify-center gap-6 text-[10px] text-gray-600">
                        <span><span className="text-cyber-green">✓</span> Free Public APIs</span>
                        <span><span className="text-cyber-green">✓</span> No Login Required</span>
                        <span><span className="text-cyber-green">✓</span> Ethical OSINT Only</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
