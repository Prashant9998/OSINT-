'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaSearch, FaEnvelope, FaUser, FaGlobe, FaPhone, FaBolt,
    FaExclamationCircle, FaCrosshairs, FaFingerprint, FaNetworkWired,
} from 'react-icons/fa'
import axios from 'axios'
import { API_KEY, getEffectiveApiUrl } from '../lib/api'

interface ScanFormProps {
    onScanInitiated: (scanId: string) => void
    onError: () => void
    overrideApiUrl?: string
}

const SCAN_TYPES = [
    { value: 'domain', label: 'Domain', icon: FaGlobe, gradient: 'from-cyan-400 to-blue-500', ring: 'ring-cyan-400/20' },
    { value: 'email', label: 'Email', icon: FaEnvelope, gradient: 'from-amber-400 to-orange-500', ring: 'ring-amber-400/20' },
    { value: 'username', label: 'Username', icon: FaUser, gradient: 'from-purple-400 to-violet-500', ring: 'ring-purple-400/20' },
    { value: 'phone', label: 'Phone', icon: FaPhone, gradient: 'from-green-400 to-emerald-500', ring: 'ring-green-400/20' },
    { value: 'full', label: 'Full Recon', icon: FaNetworkWired, gradient: 'from-rose-400 to-pink-500', ring: 'ring-rose-400/20' },
]

const PLACEHOLDERS: Record<string, string> = {
    domain: 'example.com',
    email: 'user@example.com',
    username: 'johndoe',
    phone: '+1234567890',
    full: 'example.com',
}

export default function ScanForm({ onScanInitiated, onError, overrideApiUrl }: ScanFormProps) {
    const effectiveUrl = (overrideApiUrl || getEffectiveApiUrl()).replace(/\/$/, '')
    const [target, setTarget] = useState('')
    const [scanType, setScanType] = useState('domain')
    const [deepScan, setDeepScan] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!target.trim()) { setError('Enter a target'); return }
        setLoading(true)

        // Validate
        if (scanType === 'domain' || scanType === 'full') {
            const d = target.replace(/^https?:\/\//, '').split('/')[0]
            if (!/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(d)) {
                setError('Invalid domain format'); setLoading(false); return
            }
        } else if (scanType === 'email') {
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(target)) {
                setError('Invalid email format'); setLoading(false); return
            }
        } else if (scanType === 'phone') {
            if (!/^\+?[0-9\s-]{7,20}$/.test(target)) {
                setError('Invalid phone format'); setLoading(false); return
            }
        }

        try {
            const res = await axios.post(`${effectiveUrl}/api/v1/scan`, {
                target: target.trim(), scan_type: scanType, deep_scan: deepScan,
            }, {
                headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
            })
            if (res.data.scan_id) onScanInitiated(res.data.scan_id)
            else throw new Error('No scan ID')
        } catch (err: any) {
            if (!err.response) setError(`Cannot reach ${effectiveUrl}`)
            else if (err.response.status === 401) setError('Auth failed — API key mismatch')
            else if (err.response.status === 429) setError('Rate limit — wait a minute')
            else if (err.response.status === 400) setError(err.response.data?.detail || 'Invalid input')
            else setError(err.response.data?.detail || err.message)
            onError()
        } finally { setLoading(false) }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <div className="glass shimmer-border p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan to-cyan-600 flex items-center justify-center shadow-[0_4px_20px_rgba(0,217,255,0.15)]">
                        <FaCrosshairs className="text-white text-sm" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-glow tracking-wider">INITIATE RECON</h2>
                        <p className="text-[10px] text-white/20 uppercase tracking-wider">Configure target parameters</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                    {/* Scan Type Grid */}
                    <div>
                        <label className="block text-[10px] text-white/25 uppercase tracking-[0.2em] mb-3 font-medium">Scan Module</label>
                        <div className="grid grid-cols-5 gap-2">
                            {SCAN_TYPES.map((t) => {
                                const selected = scanType === t.value
                                return (
                                    <motion.button
                                        key={t.value}
                                        type="button"
                                        onClick={() => { setScanType(t.value); setError('') }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`relative p-3 rounded-2xl border transition-all duration-500 text-center group overflow-hidden ${selected
                                                ? `border-white/10 bg-white/[0.04] ring-2 ${t.ring}`
                                                : 'border-white/[0.04] hover:border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03]'
                                            }`}
                                    >
                                        <div className={`w-9 h-9 mx-auto rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-400 ${selected ? 'shadow-lg' : 'opacity-60 group-hover:opacity-80'
                                            }`}>
                                            <t.icon className="text-white text-sm" />
                                        </div>
                                        <div className={`text-[10px] font-bold tracking-wider ${selected ? 'text-white/80' : 'text-white/30 group-hover:text-white/50'} transition-colors`}>
                                            {t.label}
                                        </div>
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Target Input */}
                    <div>
                        <label className="block text-[10px] text-white/25 uppercase tracking-[0.2em] mb-2 font-medium">Target</label>
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" />
                            <input
                                type="text"
                                value={target}
                                onChange={(e) => { setTarget(e.target.value); setError('') }}
                                placeholder={PLACEHOLDERS[scanType]}
                                className="input-cyber pl-11 font-mono"
                                required
                            />
                        </div>
                        <p className="mt-2 text-[10px] text-white/15">⚠️ Ensure you have authorization to scan this target</p>
                    </div>

                    {/* Deep Scan */}
                    <label htmlFor="deepScan" className="flex items-center gap-4 p-4 bg-white/[0.01] rounded-2xl border border-white/[0.04] cursor-pointer hover:bg-white/[0.02] transition-all group">
                        <div className="relative">
                            <input
                                type="checkbox" id="deepScan" checked={deepScan}
                                onChange={(e) => setDeepScan(e.target.checked)}
                                className="w-5 h-5 rounded-md border-white/20 accent-cyber-cyan bg-transparent"
                            />
                        </div>
                        <div>
                            <span className="text-xs font-semibold text-white/60 group-hover:text-white/80 transition-colors">Deep Scan</span>
                            <span className="block text-[10px] text-white/20 mt-0.5">Thorough analysis — slower, more data</span>
                        </div>
                    </label>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                className="flex items-start gap-2 p-3 bg-cyber-red/[0.04] border border-cyber-red/10 rounded-xl text-cyber-red text-[11px] overflow-hidden"
                            >
                                <FaExclamationCircle className="mt-0.5 shrink-0 text-[10px]" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.005 }}
                        whileTap={{ scale: loading ? 1 : 0.995 }}
                        className={`btn-primary w-full ${loading ? '!bg-gray-800 !text-white/30 !shadow-none' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                                Initializing…
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <FaBolt /> Launch Scan
                            </span>
                        )}
                    </motion.button>
                </form>

                {/* Info */}
                <div className="mt-7 pt-5 border-t border-white/[0.03]">
                    <div className="flex flex-wrap justify-center gap-6 text-[10px] text-white/15">
                        <span><span className="text-cyber-green/40">✓</span> Free APIs</span>
                        <span><span className="text-cyber-green/40">✓</span> Public Data Only</span>
                        <span><span className="text-cyber-green/40">✓</span> Ethical OSINT</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
