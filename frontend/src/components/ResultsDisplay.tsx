'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaGlobe,
    FaServer, FaGithub, FaEnvelope, FaUser, FaDownload, FaRedo,
    FaSearch, FaPhone, FaBolt, FaChevronDown, FaChevronUp, FaFileAlt
} from 'react-icons/fa'
import { API_KEY, getEffectiveApiUrl } from '../lib/api'

interface ResultsDisplayProps {
    results: any
    onNewScan: () => void
    overrideApiUrl?: string
}

function AccordionSection({
    title,
    icon: Icon,
    iconColor,
    borderColor,
    children,
    defaultOpen = false,
}: {
    title: string
    icon: React.ComponentType<any>
    iconColor: string
    borderColor: string
    children: React.ReactNode
    defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`glass-sm ${borderColor} overflow-hidden`}
        >
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor.replace('text-', 'bg-')}/10`}>
                        <Icon className={`text-sm ${iconColor}`} />
                    </div>
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${iconColor}`}>{title}</h3>
                </div>
                {open ? <FaChevronUp className="text-gray-600 text-xs" /> : <FaChevronDown className="text-gray-600 text-xs" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 border-t border-white/[0.04]">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function ResultsDisplay({ results, onNewScan, overrideApiUrl }: ResultsDisplayProps) {
    const apiUrl = (overrideApiUrl || getEffectiveApiUrl()).replace(/\/$/, '')

    const riskColors: Record<string, string> = {
        low: 'text-cyber-green',
        medium: 'text-cyber-yellow',
        high: 'text-cyber-red',
        critical: 'text-cyber-red',
    }

    const riskBg: Record<string, string> = {
        low: 'bg-cyber-green',
        medium: 'bg-cyber-yellow',
        high: 'bg-cyber-red',
        critical: 'bg-cyber-red',
    }

    const riskIcons: Record<string, React.ComponentType<any>> = {
        low: FaCheckCircle,
        medium: FaExclamationTriangle,
        high: FaExclamationTriangle,
        critical: FaShieldAlt,
    }

    const riskLevel = results.correlated_intel?.risk_level || 'low'
    const riskScore = results.correlated_intel?.risk_score || 0
    const RiskIcon = riskIcons[riskLevel] || FaCheckCircle

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `osint-scan-${results.scan_id}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleDownloadReport = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/v1/scan/${results.scan_id}/report`, {
                headers: { 'X-API-Key': API_KEY }
            })
            if (!response.ok) throw new Error('Report generation failed')
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `osint-report-${results.scan_id}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error('Download failed:', error)
            alert('Failed to download report. Please try again.')
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto space-y-4"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-gradient-cyan tracking-wider uppercase">
                    Scan Results
                </h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 px-4 py-2 bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-xs font-bold rounded-xl hover:bg-cyber-green/15 transition-all"
                    >
                        <FaFileAlt className="text-[10px]" />
                        PDF Report
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple text-xs font-bold rounded-xl hover:bg-cyber-purple/15 transition-all"
                    >
                        <FaDownload className="text-[10px]" />
                        Export JSON
                    </button>
                    <button
                        onClick={onNewScan}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyber-cyan to-cyan-400 text-cyber-dark text-xs font-bold rounded-xl hover:brightness-110 transition-all glow-cyan"
                    >
                        <FaRedo className="text-[10px]" />
                        New Scan
                    </button>
                </div>
            </div>

            {/* Risk Overview */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass p-6"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl ${riskBg[riskLevel]}/10 flex items-center justify-center`}>
                            <RiskIcon className={`text-2xl ${riskColors[riskLevel]}`} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-bold uppercase ${riskColors[riskLevel]}`}>
                                {riskLevel} Risk
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                    <div className={`h-full ${riskBg[riskLevel]}/80 rounded-full`} style={{ width: `${riskScore}%` }} />
                                </div>
                                <span className={`text-xs font-mono font-bold ${riskColors[riskLevel]}`}>{riskScore}/100</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">Target</p>
                        <p className="text-lg font-bold text-cyber-cyan font-mono">{results.target}</p>
                        <p className="text-[10px] text-gray-600 mt-1">
                            {results.total_execution_time?.toFixed(2)}s · {results.modules_executed?.length || 0} modules
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Key Findings */}
            {results.correlated_intel?.key_findings?.length > 0 && (
                <AccordionSection
                    title="Key Findings"
                    icon={FaShieldAlt}
                    iconColor="text-cyber-cyan"
                    borderColor="border-cyber-cyan/15"
                    defaultOpen={true}
                >
                    <ul className="space-y-2 mt-4">
                        {results.correlated_intel.key_findings.map((finding: string, idx: number) => (
                            <li key={idx} className="text-gray-300 text-xs flex items-start gap-2">
                                <span className="text-cyber-green mt-0.5">▸</span>
                                <span>{finding}</span>
                            </li>
                        ))}
                    </ul>
                </AccordionSection>
            )}

            {/* Phone Intelligence */}
            {results.phone_intel && (
                <AccordionSection
                    title="Phone Intelligence"
                    icon={FaPhone}
                    iconColor="text-cyber-blue"
                    borderColor="border-cyber-blue/15"
                    defaultOpen={true}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Number</p>
                            <p className="text-base font-bold text-white font-mono">{results.phone_intel.international_number || results.phone_intel.phone}</p>
                        </div>
                        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Status</p>
                            <p className={`text-base font-bold ${results.phone_intel.valid ? 'text-cyber-green' : 'text-cyber-red'}`}>
                                {results.phone_intel.valid ? '✓ Valid' : '✗ Invalid'}
                            </p>
                        </div>
                    </div>
                    {(results.phone_intel.carrier || results.phone_intel.country) && (
                        <div className="mt-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <ul className="space-y-1.5 text-xs text-gray-400">
                                {results.phone_intel.carrier && (
                                    <li className="flex justify-between"><span>Carrier:</span><span className="text-white">{results.phone_intel.carrier}</span></li>
                                )}
                                {results.phone_intel.line_type && (
                                    <li className="flex justify-between"><span>Line Type:</span><span className="text-white">{results.phone_intel.line_type}</span></li>
                                )}
                                {results.phone_intel.country && (
                                    <li className="flex justify-between"><span>Country:</span><span className="text-white">{results.phone_intel.country} ({results.phone_intel.country_code})</span></li>
                                )}
                                {results.phone_intel.location && (
                                    <li className="flex justify-between"><span>Location:</span><span className="text-white">{results.phone_intel.location}</span></li>
                                )}
                            </ul>
                        </div>
                    )}
                </AccordionSection>
            )}

            {/* Domain Intelligence */}
            {results.domain_intel && (
                <AccordionSection
                    title="Domain Intelligence"
                    icon={FaGlobe}
                    iconColor="text-cyber-cyan"
                    borderColor="border-cyber-cyan/15"
                    defaultOpen={true}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {results.domain_intel.whois_data && (
                            <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                <h4 className="text-cyber-green text-xs font-semibold mb-3 uppercase tracking-wider">WHOIS Information</h4>
                                <div className="space-y-2 text-xs">
                                    {results.domain_intel.whois_data.registrar && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Registrar:</span>
                                            <span className="text-white">{results.domain_intel.whois_data.registrar}</span>
                                        </div>
                                    )}
                                    {results.domain_intel.whois_data.domain_age_days && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Age:</span>
                                            <span className="text-white">{Math.floor(results.domain_intel.whois_data.domain_age_days / 365)} years</span>
                                        </div>
                                    )}
                                    {results.domain_intel.whois_data.registrant_country && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Country:</span>
                                            <span className="text-white">{results.domain_intel.whois_data.registrant_country}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <h4 className="text-cyber-green text-xs font-semibold mb-3 uppercase tracking-wider">Subdomains ({results.domain_intel.subdomain_count})</h4>
                            <div className="max-h-40 overflow-y-auto space-y-1 text-xs">
                                {results.domain_intel.subdomains?.slice(0, 10).map((sub: any, idx: number) => (
                                    <div key={idx} className="text-cyber-cyan font-mono text-[10px]">
                                        • {sub.subdomain}
                                    </div>
                                ))}
                                {results.domain_intel.subdomain_count > 10 && (
                                    <div className="text-gray-600 text-[10px] mt-2">
                                        + {results.domain_intel.subdomain_count - 10} more
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {results.domain_intel.insights?.length > 0 && (
                        <div className="mt-3 p-3 bg-cyber-cyan/[0.03] rounded-xl border border-cyber-cyan/10">
                            <h4 className="text-cyber-cyan text-[10px] font-semibold mb-2 uppercase tracking-wider">Security Insights</h4>
                            <ul className="space-y-1 text-[10px]">
                                {results.domain_intel.insights.map((insight: string, idx: number) => (
                                    <li key={idx} className="text-gray-400">• {insight}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </AccordionSection>
            )}

            {/* Tech Stack */}
            {results.tech_stack && (
                <AccordionSection
                    title="Technology Stack"
                    icon={FaServer}
                    iconColor="text-cyber-purple"
                    borderColor="border-cyber-purple/15"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        {results.tech_stack.web_server && (
                            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                <h4 className="text-cyber-purple text-[10px] font-semibold mb-1 uppercase">Web Server</h4>
                                <p className="text-white text-sm">{results.tech_stack.web_server}</p>
                            </div>
                        )}
                        {results.tech_stack.cdn && (
                            <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                <h4 className="text-cyber-purple text-[10px] font-semibold mb-1 uppercase">CDN</h4>
                                <p className="text-white text-sm">{results.tech_stack.cdn}</p>
                            </div>
                        )}
                        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <h4 className="text-cyber-purple text-[10px] font-semibold mb-2 uppercase">Security Headers</h4>
                            <div className="space-y-1 text-[10px]">
                                {Object.entries(results.tech_stack.security_headers || {}).map(([header, present]: any, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-gray-500">{header}</span>
                                        <span className={present ? 'text-cyber-green' : 'text-cyber-red'}>
                                            {present ? '✓' : '✗'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {results.tech_stack.technologies?.length > 0 && (
                        <div className="mt-3">
                            <h4 className="text-cyber-purple text-[10px] font-semibold mb-2 uppercase tracking-wider">Detected Technologies</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.tech_stack.technologies.map((tech: any, idx: number) => (
                                    <span key={idx} className="px-2.5 py-1 bg-cyber-purple/10 border border-cyber-purple/20 rounded-lg text-[10px] text-cyber-purple font-medium">
                                        {tech.name} {tech.version && `v${tech.version}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </AccordionSection>
            )}

            {/* GitHub Intelligence */}
            {results.github_intel && results.github_intel.total_repos_found > 0 && (
                <AccordionSection
                    title="GitHub OSINT"
                    icon={FaGithub}
                    iconColor="text-white"
                    borderColor="border-gray-600/30"
                >
                    <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <p className="text-[10px] text-gray-600 uppercase">Repos Found</p>
                            <p className="text-xl font-bold text-white">{results.github_intel.total_repos_found}</p>
                        </div>
                        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <p className="text-[10px] text-gray-600 uppercase">High-Risk</p>
                            <p className={`text-xl font-bold ${results.github_intel.high_risk_findings > 0 ? 'text-cyber-red' : 'text-cyber-green'}`}>
                                {results.github_intel.high_risk_findings}
                            </p>
                        </div>
                    </div>
                    {results.github_intel.findings?.length > 0 && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {results.github_intel.findings.map((finding: any, idx: number) => (
                                <div key={idx} className={`p-3 rounded-xl border ${finding.risk_level === 'high' || finding.risk_level === 'critical'
                                        ? 'border-cyber-red/20 bg-cyber-red/[0.03]'
                                        : 'border-white/[0.04] bg-white/[0.02]'
                                    }`}>
                                    <div className="flex items-start justify-between mb-1">
                                        <span className="text-xs font-semibold text-white">{finding.repository}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-lg ${finding.risk_level === 'high' || finding.risk_level === 'critical'
                                                ? 'bg-cyber-red/20 text-cyber-red'
                                                : 'bg-white/[0.06] text-gray-400'
                                            }`}>
                                            {finding.risk_level?.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mb-1">{finding.file_path}</p>
                                    <a href={finding.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyber-cyan hover:underline">
                                        View on GitHub →
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </AccordionSection>
            )}

            {/* Shodan */}
            {results.shodan_data && (
                <AccordionSection
                    title="Shodan Infrastructure"
                    icon={FaServer}
                    iconColor="text-cyber-red"
                    borderColor="border-cyber-red/15"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <p className="text-[10px] text-gray-600 uppercase">IP Address</p>
                            <p className="text-base font-bold text-white font-mono">{results.shodan_data.ip}</p>
                            <p className="text-[10px] text-gray-600">{results.shodan_data.isp} — {results.shodan_data.country_name}</p>
                        </div>
                        <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                            <p className="text-[10px] text-gray-600 uppercase mb-1">Open Ports</p>
                            <div className="flex flex-wrap gap-1">
                                {results.shodan_data.ports?.map((port: number, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-cyber-red/10 text-cyber-red rounded-lg text-[10px] border border-cyber-red/20 font-mono">
                                        {port}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    {results.shodan_data.vulnerabilities?.length > 0 && (
                        <div className="mt-3">
                            <h4 className="text-cyber-red text-[10px] font-semibold mb-2 uppercase">Vulnerabilities</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {results.shodan_data.vulnerabilities.map((vuln: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-cyber-red/20 text-cyber-red rounded-lg text-[10px] font-bold font-mono">
                                        {vuln}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </AccordionSection>
            )}

            {/* VirusTotal */}
            {results.virustotal_data && (
                <AccordionSection
                    title="VirusTotal Analysis"
                    icon={FaShieldAlt}
                    iconColor="text-cyber-blue"
                    borderColor="border-cyber-blue/15"
                >
                    <div className="flex items-center justify-center gap-10 mt-4 py-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-cyber-red font-mono">{results.virustotal_data.malicious_count}</p>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">Malicious</p>
                        </div>
                        <div className="w-px h-12 bg-white/[0.06]" />
                        <div className="text-center">
                            <p className="text-3xl font-bold text-cyber-green font-mono">{results.virustotal_data.harmless_count}</p>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">Harmless</p>
                        </div>
                        <div className="w-px h-12 bg-white/[0.06]" />
                        <div className="text-center">
                            <p className="text-3xl font-bold text-gray-500 font-mono">{results.virustotal_data.total_engines}</p>
                            <p className="text-[10px] text-gray-600 uppercase tracking-wider mt-1">Engines</p>
                        </div>
                    </div>
                </AccordionSection>
            )}

            {/* Hunter.io */}
            {results.hunter_data && (
                <AccordionSection
                    title="Hunter.io Emails"
                    icon={FaEnvelope}
                    iconColor="text-cyber-yellow"
                    borderColor="border-cyber-yellow/15"
                >
                    <div className="space-y-2 mt-4">
                        {results.hunter_data.emails?.map((email: any, idx: number) => (
                            <div key={idx} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04] flex justify-between items-center">
                                <div>
                                    <p className="text-white font-mono text-xs">{email.value}</p>
                                    <p className="text-[10px] text-gray-600">{email.position || 'Unknown Position'}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg ${email.type === 'personal' ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20' : 'bg-white/[0.04] text-gray-500'
                                    }`}>
                                    {email.type}
                                </span>
                            </div>
                        ))}
                    </div>
                </AccordionSection>
            )}

            {/* Google Dorking */}
            {results.google_dorking_data && results.google_dorking_data.total_results > 0 && (
                <AccordionSection
                    title="Google Dorking"
                    icon={FaSearch}
                    iconColor="text-cyber-green"
                    borderColor="border-cyber-green/15"
                >
                    <div className="space-y-3 mt-4">
                        {results.google_dorking_data.results?.map((result: any, idx: number) => (
                            <div key={idx} className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] hover:border-cyber-green/20 transition-all">
                                <h4 className="text-cyber-green font-semibold text-sm mb-1">{result.title}</h4>
                                <p className="text-[10px] text-cyber-cyan font-mono break-all mb-2">{result.link}</p>
                                {result.snippet && (
                                    <p className="text-xs text-gray-500 italic">"{result.snippet}"</p>
                                )}
                                <div className="mt-2 flex justify-end">
                                    <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyber-green hover:underline">
                                        Inspect Source →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionSection>
            )}

            {/* Recommendations */}
            {results.correlated_intel?.recommendations?.length > 0 && (
                <AccordionSection
                    title="Recommendations"
                    icon={FaExclamationTriangle}
                    iconColor="text-cyber-yellow"
                    borderColor="border-cyber-yellow/15"
                    defaultOpen={true}
                >
                    <ul className="space-y-2 mt-4">
                        {results.correlated_intel.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-gray-300 flex items-start text-xs gap-2">
                                <span className="text-cyber-yellow mt-0.5">►</span>
                                <span>{rec}</span>
                            </li>
                        ))}
                    </ul>
                </AccordionSection>
            )}
        </motion.div>
    )
}
