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
} from 'react-icons/fa'

// ─── Demo / hard-coded credentials ───────────────────────────────────────────
const DEMO_EMAIL = 'demo@osint-recon.io'
const DEMO_PASSWORD = 'OsintDemo@2025'

// Gmail "Forgot Password" mailto link – change the TO address to your support email
const SUPPORT_EMAIL = 'support@osint-recon.io'

interface AuthPageProps {
    onAuthenticated: () => void
}

type View = 'login' | 'forgot'

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
    const [view, setView] = useState<View>('login')

    // ── login state ──
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [loggingIn, setLoggingIn] = useState(false)

    // ── forgot state ──
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotSent, setForgotSent] = useState(false)

    // ─── handlers ─────────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoginError('')
        setLoggingIn(true)

        // Simulate network delay
        await new Promise(r => setTimeout(r, 1200))

        if (
            email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() &&
            password === DEMO_PASSWORD
        ) {
            // Persist auth in sessionStorage so refresh works within the tab
            sessionStorage.setItem('osint_auth', '1')
            onAuthenticated()
        } else {
            setLoginError('Invalid credentials. Use the demo account below or contact support.')
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

        // Open Gmail compose with pre-filled subject & body
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

    // ─── shared bg / layout ───────────────────────────────────────────────────
    return (
        <div className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-center">
            {/* Background grid */}
            <div
                className="fixed inset-0 bg-grid opacity-20"
                style={{ backgroundSize: '50px 50px' }}
            />

            {/* Floating glow blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 rounded-full bg-cyber-cyan opacity-5 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full bg-cyber-purple opacity-5 blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />

            {/* Logo / brand */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex flex-col items-center mb-8"
            >
                <div className="relative mb-4">
                    <FaShieldAlt className="text-6xl text-cyber-cyan animate-pulse-slow" />
                    <div className="absolute inset-0 blur-xl opacity-40 text-6xl text-cyber-cyan flex items-center justify-center">
                        <FaShieldAlt />
                    </div>
                </div>
                <h1 className="text-4xl font-bold text-cyber-cyan glitch-text tracking-widest" data-text="OSINT RECON">
                    OSINT RECON
                </h1>
                <p className="text-gray-400 text-sm mt-1 tracking-widest uppercase">
                    Information Gathering Platform
                </p>
            </motion.div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <div className="bg-cyber-dark bg-opacity-80 backdrop-blur border border-cyber-cyan border-opacity-30 rounded-2xl p-8 shadow-2xl"
                    style={{
                        boxShadow: '0 0 40px rgba(0,217,255,0.08), inset 0 0 40px rgba(0,217,255,0.03)',
                    }}
                >
                    {/* Tab switcher */}
                    <div className="flex mb-8 border-b border-cyber-cyan border-opacity-20">
                        <button
                            id="tab-login"
                            onClick={() => { setView('login'); setLoginError('') }}
                            className={`flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-colors duration-200 ${view === 'login'
                                    ? 'text-cyber-cyan border-b-2 border-cyber-cyan'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <FaLock className="inline mr-2 text-xs" />Login
                        </button>
                        <button
                            id="tab-forgot"
                            onClick={() => { setView('forgot'); setForgotSent(false) }}
                            className={`flex-1 pb-3 text-sm font-bold tracking-widest uppercase transition-colors duration-200 ${view === 'forgot'
                                    ? 'text-cyber-yellow border-b-2 border-cyber-yellow'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            <FaKey className="inline mr-2 text-xs" />Reset
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* ── LOGIN VIEW ── */}
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
                                    <label htmlFor="login-email" className="block text-xs text-gray-400 uppercase tracking-widest mb-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan text-sm opacity-60" />
                                        <input
                                            id="login-email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="operator@domain.io"
                                            className="w-full bg-black bg-opacity-40 border border-cyber-cyan border-opacity-30 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyber-cyan focus:border-opacity-80 transition-all duration-200 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="login-password" className="block text-xs text-gray-400 uppercase tracking-widest mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-cyan text-sm opacity-60" />
                                        <input
                                            id="login-password"
                                            type={showPass ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full bg-black bg-opacity-40 border border-cyber-cyan border-opacity-30 rounded-lg pl-10 pr-12 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyber-cyan focus:border-opacity-80 transition-all duration-200 text-sm"
                                        />
                                        <button
                                            type="button"
                                            id="toggle-password"
                                            onClick={() => setShowPass(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyber-cyan transition-colors"
                                        >
                                            {showPass ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error banner */}
                                <AnimatePresence>
                                    {loginError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-2 p-3 bg-cyber-red bg-opacity-10 border border-cyber-red border-opacity-40 rounded-lg text-cyber-red text-xs"
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
                                        className="text-xs text-cyber-yellow hover:text-yellow-300 transition-colors tracking-wide"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Submit */}
                                <button
                                    id="login-submit"
                                    type="submit"
                                    disabled={loggingIn}
                                    className="w-full py-3 bg-cyber-cyan text-cyber-dark font-bold rounded-lg text-sm tracking-widest uppercase hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                                    style={{
                                        boxShadow: loggingIn ? undefined : '0 0 20px rgba(0,217,255,0.3)',
                                    }}
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

                        {/* ── FORGOT PASSWORD VIEW ── */}
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
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            Enter your registered email. We'll open a pre-filled{' '}
                                            <span className="text-cyber-cyan">Gmail compose window</span> so you
                                            can send a reset request to our support team.
                                        </p>

                                        <div>
                                            <label htmlFor="forgot-email" className="block text-xs text-gray-400 uppercase tracking-widest mb-1">
                                                Registered Email
                                            </label>
                                            <div className="relative">
                                                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-yellow text-sm opacity-60" />
                                                <input
                                                    id="forgot-email"
                                                    type="email"
                                                    required
                                                    value={forgotEmail}
                                                    onChange={e => setForgotEmail(e.target.value)}
                                                    placeholder="your@email.com"
                                                    className="w-full bg-black bg-opacity-40 border border-cyber-yellow border-opacity-30 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyber-yellow focus:border-opacity-80 transition-all duration-200 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            id="forgot-submit"
                                            type="submit"
                                            className="w-full py-3 bg-cyber-yellow text-cyber-dark font-bold rounded-lg text-sm tracking-widest uppercase hover:shadow-lg transition-all duration-200"
                                            style={{ boxShadow: '0 0 20px rgba(255,215,0,0.25)' }}
                                        >
                                            <FaEnvelope className="inline mr-2" />
                                            Open Gmail Reset Request
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setView('login')}
                                            className="w-full text-center text-xs text-gray-500 hover:text-cyber-cyan transition-colors tracking-wide mt-1"
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
                                        <FaCheckCircle className="text-5xl text-cyber-green mx-auto animate-pulse-slow" />
                                        <p className="text-cyber-green font-bold text-lg">Gmail Opened!</p>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            A compose window has been opened with a pre-filled reset request.
                                            Send the email and our team will reset your password within{' '}
                                            <span className="text-cyber-cyan">24 hours</span>.
                                        </p>
                                        <button
                                            type="button"
                                            id="back-to-login"
                                            onClick={() => { setView('login'); setForgotSent(false) }}
                                            className="px-6 py-2 border border-cyber-cyan border-opacity-50 text-cyber-cyan text-sm rounded-lg hover:bg-cyber-cyan hover:bg-opacity-10 transition-all"
                                        >
                                            ← Back to Login
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Demo Account Card ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-5 p-5 bg-cyber-green bg-opacity-5 border border-cyber-green border-opacity-30 rounded-xl"
                    style={{ boxShadow: '0 0 20px rgba(0,255,65,0.06)' }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <FaTerminal className="text-cyber-green" />
                        <span className="text-cyber-green text-xs font-bold uppercase tracking-widest">
                            Demo Account — Basic Search Access
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div>
                            <p className="text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                            <p className="text-gray-200 font-mono bg-black bg-opacity-30 px-2 py-1 rounded">
                                {DEMO_EMAIL}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 uppercase tracking-wide mb-0.5">Password</p>
                            <p className="text-gray-200 font-mono bg-black bg-opacity-30 px-2 py-1 rounded">
                                {DEMO_PASSWORD}
                            </p>
                        </div>
                    </div>
                    <button
                        id="use-demo"
                        type="button"
                        onClick={fillDemo}
                        className="w-full py-2 border border-cyber-green border-opacity-50 text-cyber-green text-xs rounded-lg hover:bg-cyber-green hover:bg-opacity-10 transition-all font-bold tracking-widest uppercase"
                    >
                        ⚡ Auto-fill Demo Credentials
                    </button>
                </motion.div>

                {/* legal note */}
                <p className="text-center text-gray-600 text-xs mt-5">
                    For educational &amp; authorized security research only.
                </p>
            </motion.div>
        </div>
    )
}
