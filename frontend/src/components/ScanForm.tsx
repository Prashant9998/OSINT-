'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaEnvelope, FaUser, FaGlobe } from 'react-icons/fa'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_KEY = 'osint-recon-key-2026'

interface ScanFormProps {
    onScanInitiated: (scanId: string) => void
    onError: () => void
}

export default function ScanForm({ onScanInitiated, onError }: ScanFormProps) {
    const [target, setTarget] = useState('')
    const [scanType, setScanType] = useState<'domain' | 'email' | 'username' | 'full'>('domain')
    const [deepScan, setDeepScan] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!target.trim()) {
            alert('Please enter a target')
            return
        }

        setLoading(true)

        try {
            const response = await axios.post(
                `${API_URL}/api/v1/scan`,
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
        } catch (error: any) {
            console.error('Scan initiation error:', error)
            alert(error.response?.data?.detail || 'Failed to initiate scan')
            onError()
        } finally {
            setLoading(false)
        }
    }

    const scanTypes = [
        { value: 'domain', label: 'Domain', icon: FaGlobe, description: 'WHOIS, DNS, Subdomains, Tech Stack' },
        { value: 'email', label: 'Email', icon: FaEnvelope, description: 'MX Records, Breach Check, Validation' },
        { value: 'username', label: 'Username', icon: FaUser, description: 'Platform Search, GitHub Profile' },
        { value: 'full', label: 'Full Scan', icon: FaSearch, description: 'All Modules (Slower)' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <div className="p-8 bg-cyber-dark border border-cyber-cyan rounded-lg neon-border scanline">
                <h2 className="text-2xl font-bold text-cyber-cyan mb-6 flex items-center">
                    <FaSearch className="mr-3" />
                    INITIATE RECONNAISSANCE SCAN
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Scan Type Selection */}
                    <div>
                        <label className="block text-cyber-green text-sm font-semibold mb-3">
                            SELECT SCAN TYPE
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {scanTypes.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setScanType(type.value as any)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${scanType === type.value
                                            ? 'border-cyber-cyan bg-cyber-cyan bg-opacity-20 neon-border'
                                            : 'border-gray-600 hover:border-cyber-cyan hover:border-opacity-50'
                                        }`}
                                >
                                    <type.icon className={`text-2xl mb-2 ${scanType === type.value ? 'text-cyber-cyan' : 'text-gray-400'}`} />
                                    <div className={`font-bold mb-1 ${scanType === type.value ? 'text-cyber-cyan' : 'text-gray-300'}`}>
                                        {type.label}
                                    </div>
                                    <div className="text-xs text-gray-500">{type.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Input */}
                    <div>
                        <label className="block text-cyber-green text-sm font-semibold mb-2">
                            TARGET {scanType === 'domain' && '(Domain)'}
                            {scanType === 'email' && '(Email Address)'}
                            {scanType === 'username' && '(Username)'}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                placeholder={
                                    scanType === 'domain' ? 'example.com' :
                                        scanType === 'email' ? 'user@example.com' :
                                            scanType === 'username' ? 'johndoe' :
                                                'example.com'
                                }
                                className="w-full px-4 py-3 bg-black bg-opacity-60 border border-cyber-cyan border-opacity-50 rounded-lg text-cyber-green placeholder-gray-500 focus:outline-none focus:border-cyber-cyan focus:border-opacity-100 transition-all terminal"
                                required
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            ⚠️ Ensure you have permission to scan this target
                        </p>
                    </div>

                    {/* Deep Scan Option */}
                    <div className="flex items-center space-x-3 p-4 bg-black bg-opacity-40 rounded-lg border border-gray-700">
                        <input
                            type="checkbox"
                            id="deepScan"
                            checked={deepScan}
                            onChange={(e) => setDeepScan(e.target.checked)}
                            className="w-5 h-5 accent-cyber-cyan"
                        />
                        <label htmlFor="deepScan" className="text-gray-300 text-sm cursor-pointer">
                            <span className="font-semibold text-cyber-cyan">Enable Deep Scan</span>
                            <span className="block text-xs text-gray-500 mt-1">
                                More thorough analysis (slower, more API calls)
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${loading
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-cyber-cyan text-cyber-dark hover:bg-opacity-90 neon-border'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin mr-3"></div>
                                INITIALIZING SCAN...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <FaSearch className="mr-3" />
                                INITIATE SCAN
                            </span>
                        )}
                    </motion.button>
                </form>

                {/* Info */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
                        <div>
                            <span className="text-cyber-green">✓</span> Free Public APIs
                        </div>
                        <div>
                            <span className="text-cyber-green">✓</span> No Login Required
                        </div>
                        <div>
                            <span className="text-cyber-green">✓</span> Ethical OSINT Only
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
