'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.push('/dashboard')
        })
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: typeof window !== 'undefined'
                    ? `${window.location.origin}/auth/callback`
                    : '',
            },
        })

        if (error) {
            setMessage(error.message)
        } else {
            setSent(true)
        }
        setLoading(false)
    }

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'linear-gradient(160deg, #0F0804 0%, #1A0F08 50%, #251508 100%)',
        }}>
            {/* Logo Area */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '12px',
                    filter: 'drop-shadow(0 0 20px rgba(212, 168, 83, 0.3))',
                }}>🪵</div>
                <h1 className="gradient-text" style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>
                    Master Carpintería
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                    Tu coach personal de carpintería
                </p>
            </div>

            {!sent ? (
                <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '380px' }}>
                    <div className="card card-elevated">
                        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', marginBottom: '6px' }}>
                            Iniciar sesión
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                            Te enviamos un link mágico a tu email. Sin contraseña.
                        </p>

                        <div className="input-group">
                            <label className="input-label">Tu email</label>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                inputMode="email"
                                autoComplete="email"
                            />
                        </div>

                        {message && (
                            <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '12px' }}>
                                {message}
                            </p>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={loading || !email}>
                            {loading ? 'Enviando...' : '✉️ Enviar link mágico'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="card card-elevated" style={{ maxWidth: '380px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📬</div>
                    <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', marginBottom: '8px' }}>
                        ¡Revisá tu email!
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        Te enviamos un link de acceso a <strong style={{ color: 'var(--accent-gold)' }}>{email}</strong>.
                        Tocá el link desde tu celular para entrar directamente.
                    </p>
                    <div style={{ marginTop: '20px' }}>
                        <button className="btn btn-ghost" onClick={() => setSent(false)}>
                            ← Cambiar email
                        </button>
                    </div>
                </div>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '32px', textAlign: 'center', maxWidth: '280px' }}>
                Tu plan de carpintería, coaching con IA y seguimiento semanal en un solo lugar.
            </p>
        </div>
    )
}
