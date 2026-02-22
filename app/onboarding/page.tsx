'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const QUESTIONS = [
    {
        id: 'hours_weekday',
        label: '¿Cuántas horas podés dedicar a la carpintería entre semana (lunes a viernes), después del trabajo?',
        type: 'select',
        options: ['0.5', '1', '1.5', '2', '3'],
        optionLabels: ['30 minutos', '1 hora', '1.5 horas', '2 horas', '3+ horas'],
        icon: '⏰',
    },
    {
        id: 'hours_weekend',
        label: '¿Cuántas horas podés dedicar los fines de semana en total (sábado + domingo)?',
        type: 'select',
        options: ['2', '4', '6', '8', '12'],
        optionLabels: ['2 horas', '4 horas', '6 horas', '8 horas', '12+ horas'],
        icon: '📅',
    },
    {
        id: 'space',
        label: '¿Qué espacio tenés disponible para trabajar?',
        type: 'select',
        options: ['balcon', 'habitacion', 'garage_pequeno', 'garage_grande', 'taller'],
        optionLabels: ['Balcón o terraza pequeña', 'Habitación/cuarto', 'Garage pequeño', 'Garage amplio', 'Taller propio'],
        icon: '🏠',
    },
    {
        id: 'budget',
        label: '¿Cuánto presupuesto mensual aproximado podés destinar a madera, herramientas e insumos?',
        type: 'select',
        options: ['5000', '10000', '20000', '30000', '50000'],
        optionLabels: ['~$5.000 ARS', '~$10.000 ARS', '~$20.000 ARS', '~$30.000 ARS', '+$50.000 ARS'],
        icon: '💰',
    },
    {
        id: 'experience',
        label: '¿Cuál es tu nivel actual de experiencia en carpintería?',
        type: 'select',
        options: ['cero', 'principiante', 'intermedio_bajo', 'intermedio'],
        optionLabels: [
            'Casi cero (nunca hice nada)',
            'Principiante (algún proyecto simple)',
            'Intermedio bajo (conozco las herramientas)',
            'Intermedio (he hecho varios proyectos)',
        ],
        icon: '🎯',
    },
]

export default function OnboardingPage() {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) router.push('/auth')
            else setUser(user)
        })
    }, [])

    const current = QUESTIONS[step]
    const isLast = step === QUESTIONS.length - 1
    const progress = ((step) / QUESTIONS.length) * 100

    const handleSelect = (value: string) => {
        setAnswers((prev) => ({ ...prev, [current.id]: value }))
    }

    const handleNext = async () => {
        if (!answers[current.id]) return

        if (!isLast) {
            setStep((s) => s + 1)
            return
        }

        setSaving(true)
        const { error } = await supabase.from('profiles').upsert({
            user_id: user.id,
            hours_weekday: parseFloat(answers.hours_weekday),
            hours_weekend: parseFloat(answers.hours_weekend),
            space: answers.space,
            budget: parseInt(answers.budget),
            experience: answers.experience,
            onboarding_complete: true,
        })

        if (error) {
            console.error(error)
            setSaving(false)
            return
        }
        router.push('/dashboard')
    }

    if (!user) return (
        <div className="loading-center">
            <div className="loading-spinner" />
        </div>
    )

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'linear-gradient(160deg, #0F0804 0%, #1A0F08 50%, #251508 100%)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '480px',
            margin: '0 auto',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
                    Pregunta {step + 1} de {QUESTIONS.length}
                </p>
                <div className="progress-bar" style={{ marginBottom: '0' }}>
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Question */}
            <div className="fade-in" key={step} style={{ flex: 1 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{current.icon}</div>
                <h2 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    marginBottom: '24px',
                    lineHeight: 1.4,
                    color: 'var(--text-primary)',
                }}>
                    {current.label}
                </h2>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {current.options.map((opt, i) => (
                        <button
                            key={opt}
                            onClick={() => handleSelect(opt)}
                            style={{
                                padding: '14px 18px',
                                borderRadius: 'var(--radius-sm)',
                                border: answers[current.id] === opt
                                    ? '2px solid var(--accent-gold)'
                                    : '1px solid var(--border)',
                                background: answers[current.id] === opt
                                    ? 'rgba(212, 168, 83, 0.12)'
                                    : 'var(--surface-2)',
                                color: answers[current.id] === opt ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '0.95rem',
                                fontWeight: answers[current.id] === opt ? 600 : 400,
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                transition: 'var(--transition)',
                            }}
                        >
                            <span style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: answers[current.id] === opt ? '2px solid var(--accent-gold)' : '1.5px solid var(--border-active)',
                                background: answers[current.id] === opt ? 'var(--accent-gold)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                {answers[current.id] === opt && <span style={{ color: 'var(--wood-deep)', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
                            </span>
                            {current.optionLabels?.[i] || opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer buttons */}
            <div style={{ marginTop: '32px', display: 'flex', gap: '10px' }}>
                {step > 0 && (
                    <button
                        className="btn btn-ghost"
                        style={{ width: 'auto', padding: '14px 20px' }}
                        onClick={() => setStep((s) => s - 1)}
                    >
                        ←
                    </button>
                )}
                <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={!answers[current.id] || saving}
                >
                    {saving ? 'Guardando...' : isLast ? '🚀 Comenzar mi plan' : 'Siguiente →'}
                </button>
            </div>
        </div>
    )
}
