'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FaShieldAlt,
    FaLock,
    FaUser,
    FaEye,
    FaEyeSlash,
    FaEnvelope,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTerminal,
    FaKey,
    FaBolt,
} from 'react-icons/fa'

// Demo / hard-coded credentials
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
        <div className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-center px-4">
            {/* Background */}
            <div className="fixed inset-0 bg-grid opacity-10" style={{ backgroundSize: '50px 50px' }} />
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyber-cyan/[0.04] blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyber-purple/[0.04] blur-[150px] pointer-events-none" />

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex flex-col items-center mb-10"
            >
                <div className="relative mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-cyber-cyan/10 flex items-center justify-center border border-cyber-cyan/20">
                        <FaShieldAlt className="text-4xl text-cyber-cyan" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 bg-cyber-cyan" />
                </div>
                <h1 className="text-3xl font-bold tracking-[0.15em] text-gradient-cyan glitch-text" data-text="OSINT RECON">
                    OSINT RECON
                </h1>
                <p className="text-gray-500 text-[10px] mt-2 tracking-[0.3em] uppercase">
                    Intelligence Gathering Platform
                </p>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass p-8">
                    {/* Tab switcher */}
                    <div className="flex mb-8 gap-1 bg-white/[0.03] rounded-xl p-1">
                        <button
                            id="tab-login"
                            onClick={() => { setView('login'); setLoginError('') }}
                            className={`flex-1 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-200 rounded-lg ${view === 'login'
                                    ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20'
                                    : 'text-gray-500 hover:text-gray-300 border border-transparent'
                                }`}
                        >
                            <FaLock className="inline mr-2 text-[10px]" />Login
                        </button>
                        <button
                            id="tab-forgot"
                            onClick={() => { setView('forgot'); setForgotSent(false) }}
                            className={`flex-1 py-2.5 text-xs font-bold tracking-widest uppercase transition-all duration-200 rounded-lg ${view === 'forgot'
                                    ? 'bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/20'
                                    : 'text-gray-500 hover:text-gray-300 border border-transparent'
                                }`}
                        >
                            <FaKey className="inline mr-2 text-[10px]" />Reset
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* LOGIN */}
                        {view === 'login' && (
                            <motion.form
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.25 }}
                                onSubmit={handleLogin}
                                className="space-y-5"
                            >
                                {/* Email */}
                                <div>
                                    <label htmlFor="login-email" className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyber-cyan/40 text-xs" />
                                        <input
                                            id="login-email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="operator@domain.io"
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyber-cyan/40 focus:ring-1 focus:ring-cyber-cyan/20 transition-all duration-200 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="login-password" className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyber-cyan/40 text-xs" />
                                        <input
                                            id="login-password"
                                            type={showPass ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-12 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyber-cyan/40 focus:ring-1 focus:ring-cyber-cyan/20 transition-all duration-200 text-sm"
                                        />
                                        <button
                                            type="button"
                                            id="toggle-password"
                                            onClick={() => setShowPass(v => !v)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-cyber-cyan transition-colors"
                                        >
                                            {showPass ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error */}
                                <AnimatePresence>
                                    {loginError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-2 p-3 bg-cyber-red/5 border border-cyber-red/20 rounded-xl text-cyber-red text-xs"
                                        >
                                            <FaExclamationTriangle className="mt-0.5 shrink-0" />
                                            {loginError}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Forgot link */}
                                <div className="text-right">
                                    <button
                                        type="button"
                                        id="forgot-link"
                                        onClick={() => { setView('forgot'); setForgotSent(false) }}
                                        className="text-[10px] text-cyber-yellow/70 hover:text-cyber-yellow transition-colors tracking-wide"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit */}
                                <button
                                    id="login-submit"
                                    type="submit"
                                    disabled={loggingIn}
                                    className="w-full py-3.5 bg-gradient-to-r from-cyber-cyan to-cyan-400 text-cyber-dark font-bold rounded-xl text-sm tracking-widest uppercase hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed glow-cyan"
                                >
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

                        {/* FORGOT PASSWORD */}
                        {view === 'forgot' && (
                            <motion.div
                                key="forgot"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                {!forgotSent ? (
                                    <form onSubmit={handleForgot} className="space-y-5">
                                        <p className="text-gray-500 text-xs leading-relaxed">
                                            Enter your registered email. We'll open a pre-filled{' '}
                                            <span className="text-cyber-cyan">Gmail compose window</span> so you
                                            can send a reset request.
                                        </p>
                                        <div>
                                            <label htmlFor="forgot-email" className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                                                Registered Email
                                            </label>
                                            <div className="relative">
                                                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyber-yellow/40 text-xs" />
                                                <input
                                                    id="forgot-email"
                                                    type="email"
                                                    required
                                                    value={forgotEmail}
                                                    onChange={e => setForgotEmail(e.target.value)}
                                                    placeholder="your@email.com"
                                                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyber-yellow/40 focus:ring-1 focus:ring-cyber-yellow/20 transition-all duration-200 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            id="forgot-submit"
                                            type="submit"
                                            className="w-full py-3.5 bg-gradient-to-r from-cyber-yellow to-amber-400 text-cyber-dark font-bold rounded-xl text-sm tracking-widest uppercase hover:brightness-110 transition-all duration-200"
                                            style={{ boxShadow: '0 0 20px rgba(255,215,0,0.15)' }}
                                        >
                                            <FaEnvelope className="inline mr-2" />
                                            Open Gmail Reset Request
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setView('login')}
                                            className="w-full text-center text-[10px] text-gray-600 hover:text-cyber-cyan transition-colors tracking-wide mt-1"
                                        >
                                            ← Back to Login
                                        </button>
                                    </form>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center space-y-4 py-4"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-cyber-green/10 flex items-center justify-center mx-auto">
                                            <FaCheckCircle className="text-3xl text-cyber-green" />
                                        </div>
                                        <p className="text-cyber-green font-bold text-lg">Gmail Opened!</p>
                                        <p className="text-gray-500 text-xs leading-relaxed">
                                            Send the email and our team will reset your password within{' '}
                                            <span className="text-cyber-cyan">24 hours</span>.
                                        </p>
                                        <button
                                            type="button"
                                            id="back-to-login"
                                            onClick={() => { setView('login'); setForgotSent(false) }}
                                            className="px-6 py-2.5 border border-cyber-cyan/30 text-cyber-cyan text-xs rounded-xl hover:bg-cyber-cyan/5 transition-all"
                                        >
                                            ← Back to Login
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Demo Account Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-5 glass-sm p-5 border-cyber-green/15 bg-cyber-green/[0.02]"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <FaTerminal className="text-cyber-green text-xs" />
                        <span className="text-cyber-green text-[10px] font-bold uppercase tracking-[0.2em]">
                            Demo Access
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div>
                            <p className="text-gray-600 uppercase tracking-wide text-[10px] mb-1">Email</p>
                            <p className="text-gray-300 font-mono text-[11px] bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/[0.04]">
                                {DEMO_EMAIL}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 uppercase tracking-wide text-[10px] mb-1">Password</p>
                            <p className="text-gray-300 font-mono text-[11px] bg-black/30 px-2.5 py-1.5 rounded-lg border border-white/[0.04]">
                                {DEMO_PASSWORD}
                            </p>
                        </div>
                    </div>
                    <button
                        id="use-demo"
                        type="button"
                        onClick={fillDemo}
                        className="w-full py-2.5 border border-cyber-green/30 text-cyber-green text-[10px] rounded-xl hover:bg-cyber-green/5 transition-all font-bold tracking-[0.2em] uppercase"
                    >
                        <FaBolt className="inline mr-1" /> Auto-fill Demo
                    </button>
                </motion.div>

                <p className="text-center text-gray-700 text-[10px] mt-5">
                    For educational & authorized security research only.
                </p>
            </motion.div>
        </div>
    )
}
