'use client'

import { motion } from 'framer-motion'
import {
    FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaGlobe,
    FaServer, FaGithub, FaEnvelope, FaUser, FaDownload, FaRedo
} from 'react-icons/fa'

interface ResultsDisplayProps {
    results: any
    onNewScan: () => void
}

export default function ResultsDisplay({ results, onNewScan }: ResultsDisplayProps) {
    const riskColors = {
        low: 'cyber-green',
        medium: 'cyber-yellow',
        high: 'cyber-red',
        critical: 'cyber-red',
    }

    const riskIcons = {
        low: FaCheckCircle,
        medium: FaExclamationTriangle,
        high: FaExclamationTriangle,
        critical: FaShieldAlt,
    }

    const riskLevel = results.correlated_intel?.risk_level || 'low'
    const riskScore = results.correlated_intel?.risk_score || 0
    const RiskIcon = riskIcons[riskLevel as keyof typeof riskIcons]

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `osint-scan-${results.scan_id}.json`
        a.click()
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto space-y-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-cyber-cyan glitch-text" data-text="SCAN RESULTS">
                    SCAN RESULTS
                </h2>
                <div className="flex space-x-3">
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-cyber-purple text-white rounded-lg hover:bg-opacity-80 transition-all flex items-center space-x-2"
                    >
                        <FaDownload />
                        <span>Export JSON</span>
                    </button>
                    <button
                        onClick={onNewScan}
                        className="px-4 py-2 bg-cyber-cyan text-cyber-dark font-bold rounded-lg hover:bg-opacity-80 transition-all flex items-center space-x-2"
                    >
                        <FaRedo />
                        <span>New Scan</span>
                    </button>
                </div>
            </div>

            {/* Risk Overview */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-6 border-2 border-${riskColors[riskLevel as keyof typeof riskColors]} rounded-lg bg-${riskColors[riskLevel as keyof typeof riskColors]} bg-opacity-10 neon-border-${riskLevel === 'low' ? 'green' : 'red'}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <RiskIcon className={`text-5xl text-${riskColors[riskLevel as keyof typeof riskColors]}`} />
                        <div>
                            <h3 className="text-2xl font-bold text-white uppercase">
                                {riskLevel} RISK
                            </h3>
                            <p className="text-gray-400">Risk Score: <span className={`text-${riskColors[riskLevel as keyof typeof riskColors]} font-bold`}>{riskScore}/100</span></p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Target</p>
                        <p className="text-xl font-bold text-cyber-cyan">{results.target}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Execution Time: {results.total_execution_time?.toFixed(2)}s
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Key Findings */}
            {results.correlated_intel?.key_findings && results.correlated_intel.key_findings.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-cyber-dark border border-cyber-cyan rounded-lg scanline"
                >
                    <h3 className="text-xl font-bold text-cyber-cyan mb-4 flex items-center">
                        <FaShieldAlt className="mr-3" />
                        KEY FINDINGS
                    </h3>
                    <ul className="space-y-2">
                        {results.correlated_intel.key_findings.map((finding: string, idx: number) => (
                            <li key={idx} className="text-gray-300 flex items-start">
                                <span className="text-cyber-green mr-3 mt-1">▸</span>
                                <span>{finding}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Domain Intelligence */}
            {results.domain_intel && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 bg-cyber-dark border border-cyber-cyan border-opacity-50 rounded-lg"
                >
                    <h3 className="text-xl font-bold text-cyber-cyan mb-4 flex items-center">
                        <FaGlobe className="mr-3" />
                        DOMAIN INTELLIGENCE
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* WHOIS Data */}
                        {results.domain_intel.whois_data && (
                            <div className="p-4 bg-black bg-opacity-40 rounded-lg border border-gray-700">
                                <h4 className="text-cyber-green font-semibold mb-3">WHOIS Information</h4>
                                <div className="space-y-2 text-sm">
                                    {results.domain_intel.whois_data.registrar && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Registrar:</span>
                                            <span className="text-white">{results.domain_intel.whois_data.registrar}</span>
                                        </div>
                                    )}
                                    {results.domain_intel.whois_data.domain_age_days && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Age:</span>
                                            <span className="text-white">{Math.floor(results.domain_intel.whois_data.domain_age_days / 365)} years</span>
                                        </div>
                                    )}
                                    {results.domain_intel.whois_data.registrant_country && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Country:</span>
                                            <span className="text-white">{results.domain_intel.whois_data.registrant_country}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Subdomains */}
                        <div className="p-4 bg-black bg-opacity-40 rounded-lg border border-gray-700">
                            <h4 className="text-cyber-green font-semibold mb-3">Subdomains ({results.domain_intel.subdomain_count})</h4>
                            <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
                                {results.domain_intel.subdomains?.slice(0, 10).map((sub: any, idx: number) => (
                                    <div key={idx} className="text-cyber-cyan font-mono text-xs">
                                        • {sub.subdomain}
                                    </div>
                                ))}
                                {results.domain_intel.subdomain_count > 10 && (
                                    <div className="text-gray-500 text-xs mt-2">
                                        + {results.domain_intel.subdomain_count - 10} more subdomains
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    {results.domain_intel.insights && results.domain_intel.insights.length > 0 && (
                        <div className="mt-4 p-4 bg-cyber-cyan bg-opacity-10 rounded-lg border border-cyber-cyan border-opacity-30">
                            <h4 className="text-cyber-cyan font-semibold mb-2 text-sm">Security Insights</h4>
                            <ul className="space-y-1 text-xs">
                                {results.domain_intel.insights.map((insight: string, idx: number) => (
                                    <li key={idx} className="text-gray-300">{insight}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Tech Stack */}
            {results.tech_stack && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 bg-cyber-dark border border-cyber-purple border-opacity-50 rounded-lg"
                >
                    <h3 className="text-xl font-bold text-cyber-purple mb-4 flex items-center">
                        <FaServer className="mr-3" />
                        TECHNOLOGY STACK
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Web Server */}
                        {results.tech_stack.web_server && (
                            <div className="p-4 bg-black bg-opacity-40 rounded-lg border border-gray-700">
                                <h4 className="text-cyber-purple font-semibold mb-2 text-sm">Web Server</h4>
                                <p className="text-white">{results.tech_stack.web_server}</p>
                            </div>
                        )}

                        {/* CDN */}
                        {results.tech_stack.cdn && (
                            <div className="p-4 bg-black bg-opacity-40 rounded-lg border border-gray-700">
                                <h4 className="text-cyber-purple font-semibold mb-2 text-sm">CDN</h4>
                                <p className="text-white">{results.tech_stack.cdn}</p>
                            </div>
                        )}

                        {/* Security Headers */}
                        <div className="p-4 bg-black bg-opacity-40 rounded-lg border border-gray-700">
                            <h4 className="text-cyber-purple font-semibold mb-2 text-sm">Security Headers</h4>
                            <div className="space-y-1 text-xs">
                                {Object.entries(results.tech_stack.security_headers || {}).map(([header, present]: any, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-gray-400">{header}</span>
                                        <span className={present ? 'text-cyber-green' : 'text-cyber-red'}>
                                            {present ? '✓' : '✗'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Technologies */}
                    {results.tech_stack.technologies && results.tech_stack.technologies.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-cyber-purple font-semibold mb-3">Detected Technologies</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.tech_stack.technologies.map((tech: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="px-3 py-1 bg-cyber-purple bg-opacity-20 border border-cyber-purple border-opacity-50 rounded-full text-xs text-cyber-purple"
                                    >
                                        {tech.name} {tech.version && `v${tech.version}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* GitHub Intelligence */}
            {results.github_intel && results.github_intel.total_repos_found > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 bg-cyber-dark border border-gray-600 rounded-lg"
                >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <FaGithub className="mr-3" />
                        GITHUB OSINT
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-black bg-opacity-40 rounded-lg">
                            <p className="text-gray-400 text-sm">Repositories Found</p>
                            <p className="text-2xl font-bold text-white">{results.github_intel.total_repos_found}</p>
                        </div>
                        <div className="p-4 bg-black bg-opacity-40 rounded-lg">
                            <p className="text-gray-400 text-sm">High-Risk Findings</p>
                            <p className={`text-2xl font-bold ${results.github_intel.high_risk_findings > 0 ? 'text-cyber-red' : 'text-cyber-green'}`}>
                                {results.github_intel.high_risk_findings}
                            </p>
                        </div>
                    </div>

                    {results.github_intel.findings && results.github_intel.findings.length > 0 && (
                        <div>
                            <h4 className="text-cyber-yellow font-semibold mb-3">Findings</h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {results.github_intel.findings.map((finding: any, idx: number) => (
                                    <div key={idx} className={`p-3 rounded-lg border ${finding.risk_level === 'high' || finding.risk_level === 'critical'
                                            ? 'border-cyber-red bg-cyber-red bg-opacity-10'
                                            : 'border-gray-700 bg-black bg-opacity-40'
                                        }`}>
                                        <div className="flex items-start justify-between mb-1">
                                            <span className="text-sm font-semibold text-white">{finding.repository}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${finding.risk_level === 'high' || finding.risk_level === 'critical'
                                                    ? 'bg-cyber-red text-white'
                                                    : 'bg-gray-700 text-gray-300'
                                                }`}>
                                                {finding.risk_level.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-1">{finding.file_path}</p>
                                        <a
                                            href={finding.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-cyber-cyan hover:underline"
                                        >
                                            View on GitHub →
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Recommendations */}
            {results.correlated_intel?.recommendations && results.correlated_intel.recommendations.length > 0 && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 bg-cyber-dark border border-cyber-yellow rounded-lg"
                >
                    <h3 className="text-xl font-bold text-cyber-yellow mb-4 flex items-center">
                        <FaExclamationTriangle className="mr-3" />
                        RECOMMENDATIONS
                    </h3>
                    <ul className="space-y-2">
                        {results.correlated_intel.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-gray-300 flex items-start text-sm">
                                <span className="text-cyber-yellow mr-3 mt-1">►</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </motion.div>
    )
}
