'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { MESA_ETERNA_STEPS } from '@/lib/data'

export default function ProyectoPage() {
    const [stepStatus, setStepStatus] = useState<Record<number, boolean>>({})
    const [expandedStep, setExpandedStep] = useState<number | null>(null)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth'); return }
            setUser(user)

            const { data: steps } = await supabase
                .from('project_steps')
                .select('*')
                .eq('user_id', user.id)
                .eq('project_name', 'mesa_eterna')

            const status: Record<number, boolean> = {}
            if (steps) {
                steps.forEach((s: any) => { status[s.step_number] = s.completed })
            }
            setStepStatus(status)
            setLoading(false)
        }
        load()
    }, [])

    const toggleStep = async (stepNum: number) => {
        if (!user) return
        const newVal = !stepStatus[stepNum]
        setStepStatus((prev) => ({ ...prev, [stepNum]: newVal }))

        await supabase.from('project_steps').upsert({
            user_id: user.id,
            project_name: 'mesa_eterna',
            step_number: stepNum,
            title: MESA_ETERNA_STEPS[stepNum - 1].title,
            completed: newVal,
        }, { onConflict: 'user_id,project_name,step_number' })
    }

    const completedCount = Object.values(stepStatus).filter(Boolean).length
    const progress = Math.round((completedCount / MESA_ETERNA_STEPS.length) * 100)

    if (loading) return <div className="loading-center"><div className="loading-spinner" /></div>

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🪑 Mesa Eterna</h1>
                    <p className="page-subtitle">Proyecto central de carpintería</p>
                </div>
            </div>

            <div className="page-content" style={{ paddingTop: 0 }}>
                {/* Progress Banner */}
                <div className="card card-elevated" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                            <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
                                Progreso general
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {completedCount} de {MESA_ETERNA_STEPS.length} etapas completadas
                            </p>
                        </div>
                        <span style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                            {progress}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    {progress === 100 && (
                        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--accent-green)' }}>
                            🎉 ¡Mesa Eterna completada! Sos un carpintero de verdad.
                        </div>
                    )}
                </div>

                {/* Steps */}
                <p className="section-title">Etapas del proyecto</p>
                <div className="step-track">
                    {MESA_ETERNA_STEPS.map((step, idx) => {
                        const done = !!stepStatus[step.id]
                        const isNext = !done && (idx === 0 || !!stepStatus[idx])
                        const isExpanded = expandedStep === step.id

                        return (
                            <div key={step.id} className="step-item">
                                <div className="step-line">
                                    <div className={`step-circle ${done ? 'done' : isNext ? 'active' : ''}`}>
                                        {done ? '✓' : step.icon}
                                    </div>
                                    {idx < MESA_ETERNA_STEPS.length - 1 && (
                                        <div className="step-connector" style={{
                                            background: done ? 'var(--accent-green)' : 'var(--border)',
                                        }} />
                                    )}
                                </div>

                                <div className="step-content">
                                    <div
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p className="step-title" style={{
                                                color: done ? 'var(--accent-green)' : isNext ? 'var(--text-primary)' : 'var(--text-muted)',
                                            }}>
                                                {step.title}
                                            </p>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {done && <span className="badge badge-green">✓</span>}
                                                {isNext && !done && <span className="badge badge-gold">En curso</span>}
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{isExpanded ? '▲' : '▼'}</span>
                                            </div>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                            {step.description}
                                        </p>
                                    </div>

                                    {isExpanded && (
                                        <div className="fade-in" style={{ marginTop: '12px' }}>
                                            <div className="card" style={{ padding: '12px' }}>
                                                <p className="section-title">📋 Pasos</p>
                                                {step.details.map((d, i) => (
                                                    <p key={i} style={{
                                                        fontSize: '0.85rem',
                                                        color: 'var(--text-secondary)',
                                                        padding: '4px 0 4px 14px',
                                                        position: 'relative',
                                                        lineHeight: 1.5,
                                                    }}>
                                                        <span style={{ position: 'absolute', left: 0, color: 'var(--accent-gold)' }}>{i + 1}.</span>
                                                        {d}
                                                    </p>
                                                ))}

                                                {step.materials && step.materials.length > 0 && (
                                                    <>
                                                        <div className="divider" />
                                                        <p className="section-title">🛒 Materiales</p>
                                                        {step.materials.map((m, i) => (
                                                            <p key={i} style={{
                                                                fontSize: '0.83rem',
                                                                color: 'var(--text-secondary)',
                                                                padding: '3px 0 3px 14px',
                                                                position: 'relative',
                                                            }}>
                                                                <span style={{ position: 'absolute', left: 0, color: 'var(--accent-gold)' }}>·</span>
                                                                {m}
                                                            </p>
                                                        ))}
                                                    </>
                                                )}

                                                {step.tips && step.tips.length > 0 && (
                                                    <>
                                                        <div className="divider" />
                                                        <p className="section-title">💡 Tips "eternos"</p>
                                                        {step.tips.map((t, i) => (
                                                            <p key={i} style={{
                                                                fontSize: '0.83rem',
                                                                color: 'var(--accent-gold)',
                                                                padding: '3px 0 3px 14px',
                                                                position: 'relative',
                                                                lineHeight: 1.5,
                                                            }}>
                                                                <span style={{ position: 'absolute', left: 0 }}>★</span>
                                                                {t}
                                                            </p>
                                                        ))}
                                                    </>
                                                )}

                                                <div style={{ marginTop: '14px' }}>
                                                    <button
                                                        className={`btn ${done ? 'btn-ghost' : 'btn-primary'}`}
                                                        onClick={() => toggleStep(step.id)}
                                                    >
                                                        {done ? '↩ Marcar como pendiente' : '✓ Marcar como completada'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Info box */}
                <div className="card" style={{
                    background: 'rgba(212,168,83,0.06)',
                    border: '1px solid rgba(212,168,83,0.2)',
                    marginTop: '8px',
                }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        💡 <strong style={{ color: 'var(--text-secondary)' }}>¿Por qué una mesa?</strong> Es el proyecto ideal para dominar cortes precisos, ensambles resistentes, estructura sólida y acabados profesionales — todo en un solo proyecto funcional que podés mostrar o vender.
                    </p>
                </div>
            </div>
            <Navigation />
        </div>
    )
}
