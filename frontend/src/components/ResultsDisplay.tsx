'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaGlobe,
    FaServer, FaGithub, FaEnvelope, FaUser, FaDownload, FaRedo,
    FaSearch, FaPhone, FaBolt, FaChevronDown, FaFileAlt,
    FaExternalLinkAlt, FaLock, FaFingerprint
} from 'react-icons/fa'
import { API_KEY, getEffectiveApiUrl } from '../lib/api'

interface ResultsDisplayProps {
    results: any
    onNewScan: () => void
    overrideApiUrl?: string
}

function Section({
    title, icon: Icon, gradient, children, defaultOpen = false, count,
}: {
    title: string; icon: React.ComponentType<any>; gradient: string
    children: React.ReactNode; defaultOpen?: boolean; count?: number
}) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-sm overflow-hidden"
        >
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/[0.01] transition-all duration-300 group"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="text-white text-xs" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/70 group-hover:text-white/90 transition-colors">{title}</h3>
                    {count !== undefined && (
                        <span className="tag text-white/30">{count}</span>
                    )}
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <FaChevronDown className="text-white/15 text-[10px]" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 border-t border-white/[0.03]">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function DataRow({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/[0.02] last:border-0">
            <span className="text-white/25 text-[11px]">{label}</span>
            <span className={`text-[11px] font-medium ${color || 'text-white/70'}`}>{value}</span>
        </div>
    )
}

export default function ResultsDisplay({ results, onNewScan, overrideApiUrl }: ResultsDisplayProps) {
    const apiUrl = (overrideApiUrl || getEffectiveApiUrl()).replace(/\/$/, '')

    const riskLevel = results.correlated_intel?.risk_level || 'low'
    const riskScore = results.correlated_intel?.risk_score || 0

    const riskConfig: Record<string, { gradient: string; text: string; glow: string }> = {
        low: { gradient: 'from-green-400 to-emerald-500', text: 'text-cyber-green', glow: 'shadow-[0_0_30px_rgba(0,255,65,0.1)]' },
        medium: { gradient: 'from-amber-400 to-orange-500', text: 'text-cyber-yellow', glow: 'shadow-[0_0_30px_rgba(255,215,0,0.1)]' },
        high: { gradient: 'from-rose-400 to-red-500', text: 'text-cyber-red', glow: 'shadow-[0_0_30px_rgba(255,0,85,0.1)]' },
        critical: { gradient: 'from-red-500 to-red-700', text: 'text-cyber-red', glow: 'shadow-[0_0_30px_rgba(255,0,85,0.15)]' },
    }
    const rc = riskConfig[riskLevel] || riskConfig.low

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
            const res = await fetch(`${apiUrl}/api/v1/scan/${results.scan_id}/report`, {
                headers: { 'X-API-Key': API_KEY },
            })
            if (!res.ok) throw new Error('Report generation failed')
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `osint-report-${results.scan_id}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            console.error('Download failed:', err)
        }
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-4">

            {/* Header Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-glow tracking-wider">SCAN RESULTS</h2>
                <div className="flex flex-wrap gap-2">
                    <button onClick={handleDownloadReport} className="btn-ghost !border-cyber-green/15 !text-cyber-green/60 hover:!bg-cyber-green/[0.04]">
                        <FaFileAlt className="inline mr-1.5 text-[10px]" />PDF
                    </button>
                    <button onClick={handleDownload} className="btn-ghost !border-cyber-purple/15 !text-cyber-purple/60 hover:!bg-cyber-purple/[0.04]">
                        <FaDownload className="inline mr-1.5 text-[10px]" />JSON
                    </button>
                    <button onClick={onNewScan} className="btn-primary !py-2.5 !px-5 !text-xs">
                        <FaRedo className="inline mr-1.5" />New Scan
                    </button>
                </div>
            </div>

            {/* Risk Overview */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`glass shimmer-border p-6 ${rc.glow}`}
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        {/* Risk Gauge */}
                        <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                                <circle
                                    cx="40" cy="40" r="34" fill="none"
                                    stroke="url(#riskGradient)" strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={`${(riskScore / 100) * 213.6} 213.6`}
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={riskLevel === 'low' ? '#00ff41' : riskLevel === 'medium' ? '#ffd700' : '#ff0055'} />
                                        <stop offset="100%" stopColor={riskLevel === 'low' ? '#10b981' : riskLevel === 'medium' ? '#f59e0b' : '#ef4444'} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-lg font-bold font-mono ${rc.text}`}>{riskScore}</span>
                                <span className="text-[8px] text-white/20 uppercase">/ 100</span>
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-lg font-bold uppercase tracking-wider ${rc.text}`}>
                                {riskLevel} Risk
                            </h3>
                            <p className="text-white/25 text-[11px] mt-1">
                                {results.modules_executed?.length || 0} modules · {results.total_execution_time?.toFixed(1)}s
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-[9px] text-white/15 uppercase tracking-[0.2em]">Target</p>
                        <p className="text-lg font-bold text-gradient-cyan font-mono">{results.target}</p>
                    </div>
                </div>
            </motion.div>

            {/* Key Findings */}
            {results.correlated_intel?.key_findings?.length > 0 && (
                <Section title="Key Findings" icon={FaShieldAlt} gradient="from-cyan-400 to-blue-500" defaultOpen count={results.correlated_intel.key_findings.length}>
                    <ul className="space-y-2.5 mt-4">
                        {results.correlated_intel.key_findings.map((f: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-[11px] text-white/50">
                                <span className="text-cyber-cyan/50 mt-0.5 text-[10px]">▸</span>
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* Phone Intel */}
            {results.phone_intel && (
                <Section title="Phone Intelligence" icon={FaPhone} gradient="from-green-400 to-emerald-500" defaultOpen>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                            <p className="text-[9px] text-white/15 uppercase tracking-[0.2em] mb-1">Number</p>
                            <p className="text-sm font-bold text-white/80 font-mono">{results.phone_intel.international_number || results.phone_intel.phone}</p>
                        </div>
                        <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                            <p className="text-[9px] text-white/15 uppercase tracking-[0.2em] mb-1">Status</p>
                            <p className={`text-sm font-bold ${results.phone_intel.valid ? 'text-cyber-green' : 'text-cyber-red'}`}>
                                {results.phone_intel.valid ? '✓ Valid' : '✗ Invalid'}
                            </p>
                        </div>
                    </div>
                    {(results.phone_intel.carrier || results.phone_intel.country) && (
                        <div className="mt-3 bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                            {results.phone_intel.carrier && <DataRow label="Carrier" value={results.phone_intel.carrier} />}
                            {results.phone_intel.line_type && <DataRow label="Line Type" value={results.phone_intel.line_type} />}
                            {results.phone_intel.country && <DataRow label="Country" value={`${results.phone_intel.country} (${results.phone_intel.country_code})`} />}
                            {results.phone_intel.location && <DataRow label="Location" value={results.phone_intel.location} />}
                        </div>
                    )}
                </Section>
            )}

            {/* Domain Intel */}
            {results.domain_intel && (
                <Section title="Domain Intelligence" icon={FaGlobe} gradient="from-cyan-400 to-blue-500" defaultOpen count={results.domain_intel.subdomain_count}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {results.domain_intel.whois_data && (
                            <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                                <h4 className="text-[10px] text-cyber-cyan/50 font-bold uppercase tracking-wider mb-3">WHOIS</h4>
                                {results.domain_intel.whois_data.registrar && <DataRow label="Registrar" value={results.domain_intel.whois_data.registrar} />}
                                {results.domain_intel.whois_data.domain_age_days && <DataRow label="Age" value={`${Math.floor(results.domain_intel.whois_data.domain_age_days / 365)}y`} />}
                                {results.domain_intel.whois_data.registrant_country && <DataRow label="Country" value={results.domain_intel.whois_data.registrant_country} />}
                            </div>
                        )}
                        <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                            <h4 className="text-[10px] text-cyber-cyan/50 font-bold uppercase tracking-wider mb-3">Subdomains</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {results.domain_intel.subdomains?.slice(0, 8).map((s: any, i: number) => (
                                    <p key={i} className="text-[10px] text-white/40 font-mono">• {s.subdomain}</p>
                                ))}
                                {results.domain_intel.subdomain_count > 8 && (
                                    <p className="text-[10px] text-white/15 mt-1">+ {results.domain_intel.subdomain_count - 8} more</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Section>
            )}

            {/* Tech Stack */}
            {results.tech_stack && (
                <Section title="Technology Stack" icon={FaFingerprint} gradient="from-purple-400 to-violet-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        {results.tech_stack.web_server && (
                            <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                                <p className="text-[9px] text-white/15 uppercase tracking-wider mb-1">Server</p>
                                <p className="text-sm text-white/70">{results.tech_stack.web_server}</p>
                            </div>
                        )}
                        {results.tech_stack.cdn && (
                            <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                                <p className="text-[9px] text-white/15 uppercase tracking-wider mb-1">CDN</p>
                                <p className="text-sm text-white/70">{results.tech_stack.cdn}</p>
                            </div>
                        )}
                        <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                            <p className="text-[9px] text-white/15 uppercase tracking-wider mb-2">Security Headers</p>
                            {Object.entries(results.tech_stack.security_headers || {}).map(([h, v]: any, i) => (
                                <div key={i} className="flex items-center justify-between py-1">
                                    <span className="text-[10px] text-white/25 truncate mr-2">{h}</span>
                                    <span className={v ? 'text-cyber-green text-[10px]' : 'text-cyber-red text-[10px]'}>{v ? '✓' : '✗'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {results.tech_stack.technologies?.length > 0 && (
                        <div className="mt-3">
                            <p className="text-[9px] text-white/15 uppercase tracking-wider mb-2">Technologies</p>
                            <div className="flex flex-wrap gap-1.5">
                                {results.tech_stack.technologies.map((t: any, i: number) => (
                                    <span key={i} className="tag !bg-cyber-purple/[0.06] !border-cyber-purple/10 text-cyber-purple/60">
                                        {t.name} {t.version && `v${t.version}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Section>
            )}

            {/* GitHub */}
            {results.github_intel && results.github_intel.total_repos_found > 0 && (
                <Section title="GitHub OSINT" icon={FaGithub} gradient="from-gray-400 to-gray-600" count={results.github_intel.total_repos_found}>
                    <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                        <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03] text-center">
                            <p className="text-2xl font-bold text-white/80 font-mono">{results.github_intel.total_repos_found}</p>
                            <p className="text-[9px] text-white/15 uppercase tracking-wider mt-1">Repos</p>
                        </div>
                        <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03] text-center">
                            <p className={`text-2xl font-bold font-mono ${results.github_intel.high_risk_findings > 0 ? 'text-cyber-red' : 'text-cyber-green'}`}>
                                {results.github_intel.high_risk_findings}
                            </p>
                            <p className="text-[9px] text-white/15 uppercase tracking-wider mt-1">High-Risk</p>
                        </div>
                    </div>
                    {results.github_intel.findings?.length > 0 && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {results.github_intel.findings.map((f: any, i: number) => (
                                <div key={i} className={`p-3 rounded-xl border ${f.risk_level === 'high' || f.risk_level === 'critical'
                                        ? 'border-cyber-red/10 bg-cyber-red/[0.02]'
                                        : 'border-white/[0.03] bg-white/[0.01]'
                                    }`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[11px] font-semibold text-white/60">{f.repository}</span>
                                        <span className={`tag !text-[8px] ${f.risk_level === 'high' || f.risk_level === 'critical'
                                                ? '!bg-cyber-red/10 !border-cyber-red/15 text-cyber-red'
                                                : ''
                                            }`}>{f.risk_level}</span>
                                    </div>
                                    <p className="text-[10px] text-white/20 font-mono">{f.file_path}</p>
                                    {f.url && (
                                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyber-cyan/40 hover:text-cyber-cyan transition-colors mt-1 inline-flex items-center gap-1">
                                            View <FaExternalLinkAlt className="text-[8px]" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            )}

            {/* Shodan */}
            {results.shodan_data && (
                <Section title="Shodan Infrastructure" icon={FaServer} gradient="from-rose-400 to-red-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                            <DataRow label="IP" value={<span className="font-mono">{results.shodan_data.ip}</span>} />
                            {results.shodan_data.isp && <DataRow label="ISP" value={results.shodan_data.isp} />}
                            {results.shodan_data.country_name && <DataRow label="Country" value={results.shodan_data.country_name} />}
                        </div>
                        <div className="bg-white/[0.015] rounded-xl p-4 border border-white/[0.03]">
                            <p className="text-[9px] text-white/15 uppercase tracking-wider mb-2">Open Ports</p>
                            <div className="flex flex-wrap gap-1.5">
                                {results.shodan_data.ports?.map((p: number, i: number) => (
                                    <span key={i} className="tag !bg-cyber-red/[0.06] !border-cyber-red/10 text-cyber-red/60 font-mono">{p}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    {results.shodan_data.vulnerabilities?.length > 0 && (
                        <div className="mt-3">
                            <p className="text-[9px] text-white/15 uppercase tracking-wider mb-2">Vulnerabilities</p>
                            <div className="flex flex-wrap gap-1.5">
                                {results.shodan_data.vulnerabilities.map((v: string, i: number) => (
                                    <span key={i} className="tag !bg-cyber-red/10 !border-cyber-red/15 text-cyber-red font-mono font-bold">{v}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </Section>
            )}

            {/* VirusTotal */}
            {results.virustotal_data && (
                <Section title="VirusTotal Analysis" icon={FaLock} gradient="from-blue-400 to-indigo-500">
                    <div className="flex items-center justify-center gap-10 mt-6 mb-2">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-cyber-red font-mono">{results.virustotal_data.malicious_count}</p>
                            <p className="text-[9px] text-white/15 uppercase tracking-wider mt-1">Malicious</p>
                        </div>
                        <div className="w-px h-12 bg-white/[0.04]" />
                        <div className="text-center">
                            <p className="text-3xl font-bold text-cyber-green font-mono">{results.virustotal_data.harmless_count}</p>
                            <p className="text-[9px] text-white/15 uppercase tracking-wider mt-1">Clean</p>
                        </div>
                        <div className="w-px h-12 bg-white/[0.04]" />
                        <div className="text-center">
                            <p className="text-3xl font-bold text-white/30 font-mono">{results.virustotal_data.total_engines}</p>
                            <p className="text-[9px] text-white/15 uppercase tracking-wider mt-1">Engines</p>
                        </div>
                    </div>
                </Section>
            )}

            {/* Hunter Emails */}
            {results.hunter_data && results.hunter_data.emails?.length > 0 && (
                <Section title="Hunter.io Emails" icon={FaEnvelope} gradient="from-amber-400 to-orange-500" count={results.hunter_data.emails.length}>
                    <div className="space-y-2 mt-4">
                        {results.hunter_data.emails.map((e: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white/[0.015] rounded-xl border border-white/[0.03]">
                                <div>
                                    <p className="text-white/60 font-mono text-[11px]">{e.value}</p>
                                    <p className="text-[10px] text-white/20">{e.position || '—'}</p>
                                </div>
                                <span className="tag">{e.type}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Google Dorking */}
            {results.google_dorking_data && results.google_dorking_data.total_results > 0 && (
                <Section title="Google Dorking" icon={FaSearch} gradient="from-green-400 to-emerald-500" count={results.google_dorking_data.total_results}>
                    <div className="space-y-3 mt-4">
                        {results.google_dorking_data.results?.map((r: any, i: number) => (
                            <div key={i} className="p-4 bg-white/[0.015] rounded-xl border border-white/[0.03] hover:border-white/[0.06] transition-colors">
                                <h4 className="text-cyber-green/70 font-semibold text-[11px] mb-1">{r.title}</h4>
                                <p className="text-[10px] text-cyber-cyan/30 font-mono break-all mb-1">{r.link}</p>
                                {r.snippet && <p className="text-[10px] text-white/20 italic">"{r.snippet}"</p>}
                                <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyber-green/40 hover:text-cyber-green transition-colors mt-2 inline-flex items-center gap-1">
                                    Open <FaExternalLinkAlt className="text-[8px]" />
                                </a>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Recommendations */}
            {results.correlated_intel?.recommendations?.length > 0 && (
                <Section title="Recommendations" icon={FaExclamationTriangle} gradient="from-amber-400 to-orange-500" defaultOpen>
                    <ul className="space-y-2.5 mt-4">
                        {results.correlated_intel.recommendations.map((r: string, i: number) => (
                            <li key={i} className="flex items-start gap-2.5 text-[11px] text-white/40">
                                <span className="text-cyber-yellow/50 mt-0.5 text-[10px]">►</span>
                                <span>{r}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}
        </motion.div>
    )
}
