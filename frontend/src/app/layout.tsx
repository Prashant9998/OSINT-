import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'OSINT Reconnaissance Platform',
    description: 'Professional OSINT Information Gathering Platform for Ethical Hacking',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
            </head>
            <body className="min-h-screen">{children}</body>
        </html>
    )
}
