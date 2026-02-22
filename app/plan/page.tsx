'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { LEARNING_PHASES } from '@/lib/data'

export default function PlanPage() {
    const [activePhase, setActivePhase] = useState<number | null>(1)
    const [currentPhase, setCurrentPhase] = useState(1)
    const [user, setUser] = useState<any>(null)
    const [customSteps, setCustomSteps] = useState<any[]>([])
    const [suggestions, setSuggestions] = useState<any[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth'); return }
            setUser(user)

            // Current Phase
            const { data: profile } = await supabase.from('profiles').select('current_phase').eq('user_id', user.id).single()
            if (profile?.current_phase) setCurrentPhase(profile.current_phase)

            // Custom Steps
            const { data: steps } = await supabase.from('custom_steps').select('*').eq('user_id', user.id).order('order_index', { ascending: true })
            setCustomSteps(steps || [])

            // Suggestions
            const { data: suggs } = await supabase.from('ai_suggestions')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
            setSuggestions(suggs || [])
        }
        loadData()
    }, [])

    const handleApprove = async (sugg: any) => {
        if (sugg.action_type === 'ADD_STEP') {
            const { error: insertError } = await supabase.from('custom_steps').insert({
                user_id: user.id,
                category: sugg.data.category || 'plan',
                title: sugg.data.title,
                description: sugg.data.description,
                order_index: customSteps.length
            })
            if (insertError) return
        }

        // Mark suggestion as approved
        await supabase.from('ai_suggestions').update({ status: 'approved' }).eq('id', sugg.id)
        setSuggestions(suggestions.filter(s => s.id !== sugg.id))

        // Reload steps if added
        if (sugg.action_type === 'ADD_STEP') {
            const { data: steps } = await supabase.from('custom_steps').select('*').eq('user_id', user.id).order('order_index', { ascending: true })
            setCustomSteps(steps || [])
        }
    }

    const handleReject = async (suggId: string) => {
        await supabase.from('ai_suggestions').update({ status: 'rejected' }).eq('id', suggId)
        setSuggestions(suggestions.filter(s => s.id !== suggId))
    }

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📚 Plan de Aprendizaje</h1>
                    <p className="page-subtitle">5 fases hacia maestría en carpintería</p>
                </div>
            </div>

            <div className="page-content" style={{ paddingTop: 0 }}>
                {/* AI Suggestions Banner */}
                {suggestions.length > 0 && (
                    <div className="card fade-in" style={{ border: '1px solid var(--accent-gold)', marginBottom: '16px', background: 'rgba(212,168,83,0.05)' }}>
                        <p style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '8px' }}>
                            ✨ Sugerencia del Mentor
                        </p>
                        {suggestions.map(s => (
                            <div key={s.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(212,168,83,0.1)' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{s.data.title}</p>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{s.explanation}</p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    <button onClick={() => handleApprove(s)} className="btn btn-primary" style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}>Aprobar</button>
                                    <button onClick={() => handleReject(s.id)} className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}>Omitir</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Overview banner */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(232,136,42,0.06))',
                    border: '1px solid rgba(212,168,83,0.3)',
                    marginBottom: '16px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem' }}>
                                Fase actual: {currentPhase} de 5
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {LEARNING_PHASES[currentPhase - 1]?.title}
                            </p>
                        </div>
                        <div style={{ fontSize: '2.5rem' }}>
                            {LEARNING_PHASES[currentPhase - 1]?.icon}
                        </div>
                    </div>
                    <div className="progress-bar" style={{ marginTop: '10px' }}>
                        <div className="progress-fill" style={{ width: `${(currentPhase / 5) * 100}%` }} />
                    </div>
                </div>

                {/* Phases */}
                {LEARNING_PHASES.map((phase, idx) => {
                    const isExpanded = activePhase === phase.id
                    const isActive = phase.id === currentPhase
                    const isDone = phase.id < currentPhase

                    // Filter custom steps for this phase category (assuming category matches phase.id or 'plan')
                    const phaseCustomSteps = customSteps.filter(s => s.category === `phase-${phase.id}`)

                    return (
                        <div
                            key={phase.id}
                            className="phase-card fade-in"
                            style={{
                                animationDelay: `${idx * 0.05}s`,
                                opacity: isDone ? 0.7 : 1,
                                borderLeft: isActive ? `3px solid ${phase.color}` : '1px solid var(--border)',
                            }}
                        >
                            <div className="phase-header" onClick={() => setActivePhase(isExpanded ? null : phase.id)}>
                                <div
                                    className="phase-num"
                                    style={{ background: isDone ? phase.color + '44' : isActive ? phase.color : 'var(--surface-3)' }}
                                >
                                    {isDone ? '✓' : phase.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <p style={{ fontFamily: 'Outfit', fontWeight: 700 }}>
                                            Fase {phase.id}: {phase.title}
                                        </p>
                                        {isActive && <span className="badge badge-gold">Activa</span>}
                                        {isDone && <span className="badge badge-green">✓ Completada</span>}
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{phase.subtitle} · {phase.duration}</p>
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{isExpanded ? '▲' : '▼'}</span>
                            </div>

                            {isExpanded && (
                                <div className="phase-body">
                                    {isActive && (
                                        <button
                                            onClick={async () => {
                                                const next = currentPhase + 1
                                                if (next > 5) return
                                                const { error } = await supabase.from('profiles').update({ current_phase: next }).eq('user_id', user.id)
                                                if (!error) setCurrentPhase(next)
                                            }}
                                            className="btn btn-primary"
                                            style={{ marginBottom: '16px', width: '100%', fontSize: '0.85rem' }}
                                        >
                                            ✅ Marcar Fase {phase.id} como Completada
                                        </button>
                                    )}                                    <div style={{ marginTop: '12px' }}>
                                        <p className="section-title">🎯 Objetivos</p>
                                        <ul>
                                            {phase.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                                            {/* Render Custom Steps */}
                                            {phaseCustomSteps.map((s, i) => (
                                                <li key={`custom-${s.id}`} style={{ color: 'var(--accent-gold)' }}>
                                                    ✨ {s.title}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="divider" />
                                    <div>
                                        <p className="section-title">🔧 Habilidades a dominar</p>
                                        <ul>
                                            {phase.skills.map((sk, i) => <li key={i}>{sk}</li>)}
                                        </ul>
                                    </div>
                                    <div className="divider" />
                                    <div>
                                        <p className="section-title">✏️ Ejercicios prácticos</p>
                                        <ul>
                                            {phase.exercises.map((ex, i) => <li key={i}>{ex}</li>)}
                                        </ul>
                                    </div>
                                    <div className="divider" />
                                    <div>
                                        <p className="section-title">📺 Recursos recomendados</p>
                                        <ul>
                                            {phase.resources.length > 0 ? (
                                                phase.resources.map((res: any, i) => (
                                                    <li key={i}>
                                                        {res.type === 'video' ? '🎥' : '📄'} {res.title}
                                                    </li>
                                                ))
                                            ) : (
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No hay recursos específicos aún.</p>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Custom Steps Section (Uncategorized) */}
                {customSteps.filter(s => !s.category.startsWith('phase-')).length > 0 && (
                    <>
                        <div className="section-title" style={{ marginTop: '24px' }}>Objetivos Personalizados</div>
                        {customSteps.filter(s => !s.category.startsWith('phase-')).map(s => (
                            <div key={s.id} className="card" style={{ marginBottom: '8px', borderLeft: '3px solid var(--accent-gold)' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.title}</p>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.description}</p>
                            </div>
                        ))}
                    </>
                )}

                {/* Custom Steps Section */}
                <div className="section-title" style={{ marginTop: '24px' }}>Mi Plan Personalizado</div>
                <div className="card" style={{ border: '1px dashed var(--accent-gold)', background: 'rgba(212,168,83,0.02)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        ¿Quieres ajustar el plan o añadir objetivos propios?<br />
                        <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Habla con el Mentor IA</span> para modificar tu camino.
                    </p>
                    <button
                        onClick={() => router.push('/chat')}
                        className="btn btn-secondary"
                        style={{ marginTop: '12px', width: '100%' }}
                    >
                        ⚙️ Personalizar plan con IA
                    </button>
                </div>
            </div>
            <Navigation />
        </div>
    )
}
