/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'cyber-dark': '#0a0e27',
                'cyber-darker': '#05070f',
                'cyber-cyan': '#00d9ff',
                'cyber-green': '#00ff41',
                'cyber-purple': '#8b5cf6',
                'cyber-red': '#ff0055',
                'cyber-yellow': '#ffd700',
            },
            fontFamily: {
                'mono': ['Courier New', 'monospace'],
                'tech': ['Share Tech Mono', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'scan': 'scan 2s linear infinite',
                'glitch': 'glitch 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
            },
            keyframes: {
                glow: {
                    'from': {
                        boxShadow: '0 0 5px #00d9ff, 0 0 10px #00d9ff',
                    },
                    'to': {
                        boxShadow: '0 0 10px #00d9ff, 0 0 20px #00d9ff, 0 0 30px #00d9ff',
                    }
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' }
                },
                glitch: {
                    '0%, 100%': {
                        transform: 'translate(0)',
                    },
                    '20%': {
                        transform: 'translate(-2px, 2px)',
                    },
                    '40%': {
                        transform: 'translate(-2px, -2px)',
                    },
                    '60%': {
                        transform: 'translate(2px, 2px)',
                    },
                    '80%': {
                        transform: 'translate(2px, -2px)',
                    },
                },
            },
            backgroundImage: {
                'scanline': 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
                'grid': 'linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)',
            },
        },
    },
    plugins: [],
}
