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
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) { router.push('/auth'); return }
            setUser(user)
            supabase.from('profiles').select('current_phase').eq('user_id', user.id).single()
                .then(({ data }) => { if (data?.current_phase) setCurrentPhase(data.current_phase) })
        })
    }, [])

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📚 Plan de Aprendizaje</h1>
                    <p className="page-subtitle">5 fases hacia maestría en carpintería</p>
                </div>
            </div>

            <div className="page-content" style={{ paddingTop: 0 }}>
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
