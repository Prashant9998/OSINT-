'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaShieldAlt, FaLock, FaUser, FaEye, FaEyeSlash, FaEnvelope,
    FaExclamationTriangle, FaCheckCircle, FaTerminal, FaKey, FaBolt,
    FaFingerprint,
} from 'react-icons/fa'
import ParticleBackground from './ParticleBackground'

const DEMO_EMAIL = 'demo@osint-recon.io'
const DEMO_PASSWORD = 'OsintDemo@2025'
const SUPPORT_EMAIL = 'support@osint-recon.io'

interface AuthPageProps {
    onAuthenticated: () => void
}

type View = 'login' | 'forgot'

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
    const [view, setView] = useState<View>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [loggingIn, setLoggingIn] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotSent, setForgotSent] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError('')
        setLoggingIn(true)
        await new Promise(r => setTimeout(r, 1200))

        if (
            email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() &&
            password === DEMO_PASSWORD
        ) {
            sessionStorage.setItem('osint_auth', '1')
            onAuthenticated()
        } else {
            setLoginError('Invalid credentials. Use the demo account below.')
        }
        setLoggingIn(false)
    }

    const fillDemo = () => {
        setEmail(DEMO_EMAIL)
        setPassword(DEMO_PASSWORD)
        setLoginError('')
    }

    const handleForgot = (e: React.FormEvent) => {
        e.preventDefault()
        if (!forgotEmail.trim()) return
        const subject = encodeURIComponent('[OSINT RECON] Password Reset Request')
        const body = encodeURIComponent(
            `Hello Support,\n\nPlease reset the password for my account:\nEmail: ${forgotEmail}\n\nThank you.`
        )
        window.open(
            `https://mail.google.com/mail/?view=cm&to=${SUPPORT_EMAIL}&su=${subject}&body=${body}`,
            '_blank'
        )
        setForgotSent(true)
    }

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center px-4">
            <ParticleBackground />

            {/* Ambient blobs */}
            <div className="fixed inset-0 pointer-events-none z-[1]">
                <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-cyber-cyan/[0.03] blur-[150px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-cyber-purple/[0.04] blur-[130px]" />
            </div>

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex flex-col items-center mb-12"
            >
                <div className="relative mb-6">
                    <motion.div
                        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyber-cyan via-cyan-500 to-blue-600 flex items-center justify-center pulse-ring"
                        animate={{ rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <FaShieldAlt className="text-4xl text-white drop-shadow-lg" />
                    </motion.div>
                    <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-cyber-cyan/20 to-transparent blur-2xl" />
                </div>
                <h1 className="text-4xl font-bold tracking-[0.2em] text-glow glitch-text" data-text="OSINT RECON">
                    OSINT RECON
                </h1>
                <p className="text-white/15 text-[10px] mt-3 tracking-[0.4em] uppercase font-medium">
                    Intelligence Gathering Platform
                </p>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-[420px]"
            >
                <div className="glass shimmer-border p-8">
                    {/* Tabs */}
                    <div className="flex mb-8 gap-1 bg-white/[0.02] rounded-2xl p-1">
                        <button
                            id="tab-login"
                            onClick={() => { setView('login'); setLoginError('') }}
                            className={`flex-1 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-xl ${view === 'login'
                                    ? 'bg-gradient-to-r from-cyber-cyan/15 to-cyan-500/10 text-cyber-cyan border border-cyber-cyan/15 shadow-[0_0_20px_rgba(0,217,255,0.05)]'
                                    : 'text-white/25 hover:text-white/40 border border-transparent'
                                }`}
                        >
                            <FaFingerprint className="inline mr-2 text-[9px]" />Login
                        </button>
                        <button
                            id="tab-forgot"
                            onClick={() => { setView('forgot'); setForgotSent(false) }}
                            className={`flex-1 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-xl ${view === 'forgot'
                                    ? 'bg-gradient-to-r from-cyber-yellow/15 to-amber-500/10 text-cyber-yellow border border-cyber-yellow/15'
                                    : 'text-white/25 hover:text-white/40 border border-transparent'
                                }`}
                        >
                            <FaKey className="inline mr-2 text-[9px]" />Reset
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {view === 'login' && (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                onSubmit={handleLogin}
                                className="space-y-5"
                            >
                                <div>
                                    <label htmlFor="login-email" className="block text-[10px] text-white/25 uppercase tracking-[0.2em] mb-2 font-medium">Email</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15 text-xs" />
                                        <input
                                            id="login-email" type="email" autoComplete="email" required
                                            value={email} onChange={e => setEmail(e.target.value)}
                                            placeholder="operator@domain.io"
                                            className="input-cyber pl-11"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="login-password" className="block text-[10px] text-white/25 uppercase tracking-[0.2em] mb-2 font-medium">Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15 text-xs" />
                                        <input
                                            id="login-password" type={showPass ? 'text' : 'password'} autoComplete="current-password" required
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••••"
                                            className="input-cyber pl-11 pr-12"
                                        />
                                        <button type="button" id="toggle-password" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
                                            {showPass ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {loginError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-2 p-3 bg-cyber-red/[0.06] border border-cyber-red/15 rounded-xl text-cyber-red text-[11px]"
                                        >
                                            <FaExclamationTriangle className="mt-0.5 shrink-0 text-[10px]" />
                                            {loginError}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="text-right">
                                    <button type="button" id="forgot-link" onClick={() => { setView('forgot'); setForgotSent(false) }}
                                        className="text-[10px] text-white/20 hover:text-cyber-yellow transition-colors tracking-wider">
                                        Forgot password?
                                    </button>
                                </div>

                                <button id="login-submit" type="submit" disabled={loggingIn} className="btn-primary w-full">
                                    {loggingIn ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Authenticating…
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <FaShieldAlt /> Access Platform
                                        </span>
                                    )}
                                </button>
                            </motion.form>
                        )}

                        {view === 'forgot' && (
                            <motion.div
                                key="forgot"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {!forgotSent ? (
                                    <form onSubmit={handleForgot} className="space-y-5">
                                        <p className="text-white/25 text-[11px] leading-relaxed">
                                            Enter your email to open a pre-filled <span className="text-cyber-cyan/60">Gmail compose window</span> for a reset request.
                                        </p>
                                        <div>
                                            <label htmlFor="forgot-email" className="block text-[10px] text-white/25 uppercase tracking-[0.2em] mb-2 font-medium">Email</label>
                                            <div className="relative">
                                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15 text-xs" />
                                                <input
                                                    id="forgot-email" type="email" required
                                                    value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                                                    placeholder="your@email.com"
                                                    className="input-cyber pl-11"
                                                />
                                            </div>
                                        </div>
                                        <button id="forgot-submit" type="submit" className="btn-primary w-full !bg-gradient-to-r !from-cyber-yellow !to-amber-500" style={{ boxShadow: '0 0 20px rgba(255,215,0,0.1)' }}>
                                            <FaEnvelope className="inline mr-2" /> Open Gmail Reset
                                        </button>
                                        <button type="button" onClick={() => setView('login')} className="w-full text-center text-[10px] text-white/20 hover:text-white/40 transition-colors tracking-wider mt-2">← Back to Login</button>
                                    </form>
                                ) : (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 py-6">
                                        <div className="w-16 h-16 rounded-2xl bg-cyber-green/10 flex items-center justify-center mx-auto">
                                            <FaCheckCircle className="text-2xl text-cyber-green" />
                                        </div>
                                        <p className="text-cyber-green font-bold">Gmail Opened!</p>
                                        <p className="text-white/25 text-[11px]">
                                            Send the email. Password reset within <span className="text-cyber-cyan">24 hours</span>.
                                        </p>
                                        <button type="button" id="back-to-login" onClick={() => { setView('login'); setForgotSent(false) }} className="btn-ghost">← Back to Login</button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Demo Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-5 glass-sm border-cyber-green/[0.08] p-5"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded-md bg-cyber-green/10 flex items-center justify-center">
                            <FaTerminal className="text-cyber-green text-[8px]" />
                        </div>
                        <span className="text-cyber-green/60 text-[10px] font-bold tracking-[0.2em] uppercase">Demo Access</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div>
                            <p className="text-white/15 uppercase tracking-wider text-[9px] mb-1">Email</p>
                            <p className="text-white/50 font-mono text-[10px] bg-white/[0.02] px-3 py-2 rounded-lg border border-white/[0.04]">{DEMO_EMAIL}</p>
                        </div>
                        <div>
                            <p className="text-white/15 uppercase tracking-wider text-[9px] mb-1">Password</p>
                            <p className="text-white/50 font-mono text-[10px] bg-white/[0.02] px-3 py-2 rounded-lg border border-white/[0.04]">{DEMO_PASSWORD}</p>
                        </div>
                    </div>
                    <button id="use-demo" type="button" onClick={fillDemo} className="btn-ghost w-full !border-cyber-green/15 !text-cyber-green/60 hover:!bg-cyber-green/[0.04] hover:!text-cyber-green">
                        <FaBolt className="inline mr-1" /> Auto-fill Demo
                    </button>
                </motion.div>

                <p className="text-center text-white/10 text-[10px] mt-6 tracking-wider">
                    For educational & authorized security research only.
                </p>
            </motion.div>
        </div>
    )
}
