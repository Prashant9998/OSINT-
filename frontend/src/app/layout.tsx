import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'OSINT Recon — Intelligence Gathering Platform',
    description: 'Professional OSINT Information Gathering Platform for Ethical Hacking & Security Research. Passive reconnaissance using public data sources.',
    keywords: ['OSINT', 'reconnaissance', 'security', 'ethical hacking', 'information gathering'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
            <body className="min-h-screen antialiased">{children}</body>
        </html>
    )
}
