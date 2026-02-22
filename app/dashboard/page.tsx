'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { LEARNING_PHASES } from '@/lib/data'

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [weeklyGoals, setWeeklyGoals] = useState<any[]>([])
    const [projectSteps, setProjectSteps] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth'); return }
            setUser(user)

            const { data: prof } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (!prof || !prof.onboarding_complete) {
                router.push('/onboarding')
                return
            }
            setProfile(prof)

            const { data: goals } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .eq('completed', false)
                .order('created_at', { ascending: false })
                .limit(3)

            const { data: steps } = await supabase
                .from('project_steps')
                .select('*')
                .eq('user_id', user.id)
                .eq('project_name', 'mesa_eterna')
                .order('step_number', { ascending: true })

            setWeeklyGoals(goals || [])
            setProjectSteps(steps || [])
            setLoading(false)
        }
        loadData()
    }, [])

    if (loading) return (
        <div className="loading-center">
            <div className="loading-spinner" />
        </div>
    )

    const currentPhase = profile?.current_phase || 1
    const phase = LEARNING_PHASES[currentPhase - 1]
    const completedSteps = projectSteps.filter((s) => s.completed).length
    const totalSteps = 6
    const projectProgress = Math.round((completedSteps / totalSteps) * 100)

    const experienceLabel: Record<string, string> = {
        cero: 'Principiante absoluto',
        principiante: 'Principiante',
        intermedio_bajo: 'Intermedio bajo',
        intermedio: 'Intermedio',
    }

    const spaceLabel: Record<string, string> = {
        balcon: 'Balcón',
        habitacion: 'Habitación',
        garage_pequeno: 'Garage pequeño',
        garage_grande: 'Garage grande',
        taller: 'Taller',
    }

    return (
        <div className="page-wrapper">
            <div className="page-content">
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.7rem', fontWeight: 800, marginTop: '4px' }}>
                        ¡Hola, <span className="gradient-text">Carpintero</span>! 🪵
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                        {experienceLabel[profile?.experience] || 'Carpintero'} · {spaceLabel[profile?.space] || ''} · ${profile?.budget?.toLocaleString()} ARS/mes
                    </p>
                </div>

                {/* Current Phase Card */}
                <div className="card card-elevated fade-in" style={{ borderLeft: `3px solid ${phase.color}` }}>
                    <div className="card-header">
                        <div className="card-icon" style={{ background: `${phase.color}22`, fontSize: '1.6rem' }}>
                            {phase.icon}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <p className="card-title">Fase {phase.id}: {phase.title}</p>
                                <span className="badge badge-gold">Activa</span>
                            </div>
                            <p className="card-sub">{phase.subtitle}</p>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Duración estimada: {phase.duration}
                    </p>
                    <Link href="/plan">
                        <button className="btn btn-secondary" style={{ marginTop: '4px' }}>
                            📚 Ver plan completo →
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="stat-row animate-delay-1 fade-in">
                    <div className="stat-chip">
                        <div className="stat-value">{profile?.hours_weekday || '—'}</div>
                        <div className="stat-label">hs/día (sem.)</div>
                    </div>
                    <div className="stat-chip">
                        <div className="stat-value">{profile?.hours_weekend || '—'}</div>
                        <div className="stat-label">hs/fin de semana</div>
                    </div>
                </div>

                {/* Mesa Eterna Progress */}
                <div className="card animate-delay-2 fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>🪑 Mesa Eterna</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tu proyecto central</p>
                        </div>
                        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                            {projectProgress}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${projectProgress}%` }} />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        {completedSteps} de {totalSteps} etapas completadas
                    </p>
                    <Link href="/proyecto">
                        <button className="btn btn-ghost" style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                            Ver etapas →
                        </button>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="section-title animate-delay-3 fade-in">Acciones rápidas</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    {[
                        { href: '/chat', icon: '🤖', label: 'Hablar con el Coach', sub: 'IA Mentor' },
                        { href: '/revision', icon: '📝', label: 'Revisión Semanal', sub: 'Accountability' },
                        { href: '/habitos', icon: '⏱️', label: 'Mis Hábitos', sub: 'Plan semanal' },
                        { href: '/negocio', icon: '💼', label: 'Mi Negocio', sub: 'Estrategia' },
                    ].map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div className="card animate-delay-4 fade-in" style={{ cursor: 'pointer', height: '100%' }}>
                                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{item.icon}</div>
                                <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.9rem' }}>{item.label}</p>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.sub}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Weekly Goals */}
                {weeklyGoals.length > 0 && (
                    <>
                        <div className="section-title">Metas de esta semana</div>
                        <div className="card">
                            {weeklyGoals.map((goal) => (
                                <div key={goal.id} className="check-item">
                                    <div className="check-box" />
                                    <span className="check-text">{goal.title}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* CTA Chat */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, rgba(212,168,83,0.1) 0%, rgba(232,136,42,0.08) 100%)',
                    border: '1px solid rgba(212,168,83,0.3)',
                    textAlign: 'center',
                    padding: '20px',
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '6px' }}>
                        ¿Necesitás coaching?
                    </p>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        Escribí "Revisión semanal de carpintería" para el accountability semanal
                    </p>
                    <Link href="/chat">
                        <button className="btn btn-primary">
                            Abrir Chat con IA →
                        </button>
                    </Link>
                </div>
            </div>
            <Navigation />
        </div>
    )
}
