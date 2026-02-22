import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Master Carpintería — Tu Coach de Carpintería',
    description: 'Coach personal de carpintería con IA: plan de aprendizaje, seguimiento semanal, negocio y más.',
    manifest: '/manifest.json',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <head>
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="theme-color" content="#0F0804" />
                <link rel="apple-touch-icon" href="/icon-192.png" />
            </head>
            <body>{children}</body>
        </html>
    )
}
