'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

const WEEKLY_PLAN = {
    semana: [
        { day: 'Lunes', emoji: '💪', tipo: 'teoría', activities: ['30min: Video educativo sobre técnica específica', 'Tomar notas en cuaderno de proyecto', 'Revisar el plan de la semana'] },
        { day: 'Martes', emoji: '🪚', tipo: 'práctica', activities: ['30-60min: Práctica específica (cortes, lijado, ensamble)', 'Registrar lo que hiciste y lo que salió mal'] },
        { day: 'Miércoles', emoji: '📖', tipo: 'teoría', activities: ['30min: Investigar técnica o material específico', 'Planificar próximo paso del proyecto mesa'] },
        { day: 'Jueves', emoji: '🔧', tipo: 'práctica', activities: ['30-60min: Continuar con el proyecto o ejercicio', 'Fotografiar el avance'] },
        { day: 'Viernes', emoji: '📝', tipo: 'planificación', activities: ['20min: Revisar la semana', 'Planificar el fin de semana en el taller', 'Listar materiales que necesitás'] },
    ],
    finde: [
        { day: 'Sábado', emoji: '🎯', tipo: 'proyecto', activities: ['2-4 horas en el taller', 'Sesión principal del proyecto mesa', 'Trabajar en bloque de tiempo sin distracciones', 'Fotografiar proceso'] },
        { day: 'Domingo', emoji: '🌿', tipo: 'revisión', activities: ['1-2 horas: Acabados, lijado fino, detalles', 'Limpiar y ordenar el taller', 'Revisión semanal en la app', 'Descanso: no forzar más horas'] },
    ],
}

const HABITS = [
    { icon: '📵', title: 'Reemplazá la TV', desc: 'Al llegar a casa: en vez de prender la TV, encendé una luz del taller y abrí esta app.', tip: 'Sonido ambiente > TV. Pon podcast de carpintería.' },
    { icon: '⏱️', title: 'Bloques de 25 min', desc: 'Técnica Pomodoro: 25min de trabajo enfocado + 5min de descanso. Mínimo 2 bloques por noche.', tip: 'Un timer de cocina funciona perfecto.' },
    { icon: '📓', title: 'Cuaderno de taller', desc: 'Después de cada sesión, escribí 3 cosas: qué hiciste, qué no funcionó y qué mejorarías.', tip: 'Esto acelera tu aprendizaje 3x.' },
    { icon: '📸', title: 'Foto de cada sesión', desc: 'Sacá al menos 1 foto de tu trabajo por sesión. Construís portafolio sin darte cuenta.', tip: 'En 6 meses tenés contenido para redes.' },
    { icon: '🎧', title: 'Podcast mientras hago cosas', desc: 'Mientras cocinás, manejás o hacés mandados: escuchá contenido de carpintería y negocio.', tip: 'Acumula 5-7hs de inspiración por semana.' },
    { icon: '🌙', title: 'No trabajar si estás agotado', desc: 'Las sierras y el cansancio extremo no van juntos. Mejor un video de 20min que arriesgar tu seguridad.', tip: 'El progreso es maratón, no sprint.' },
]

export default function HabitosPage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [todayLog, setTodayLog] = useState<{ id?: string, completed_habits: string[], notes: string }>({
        completed_habits: [],
        notes: ''
    })
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function loadData() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) {
                router.push('/auth')
                return
            }
            setUser(authUser)

            // Load profile for streak
            const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', authUser.id).single()
            setProfile(prof)

            // Load today's log
            const today = new Date().toISOString().split('T')[0]
            const { data: log } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', authUser.id)
                .eq('date', today)
                .single()

            if (log) {
                setTodayLog({
                    id: log.id,
                    completed_habits: log.completed_habits || [],
                    notes: log.notes || ''
                })
            }
        }
        loadData()
    }, [])

    const handleToggleHabit = (title: string) => {
        setTodayLog(prev => {
            const completed = prev.completed_habits.includes(title)
                ? prev.completed_habits.filter(h => h !== title)
                : [...prev.completed_habits, title]
            return { ...prev, completed_habits: completed }
        })
    }

    const saveLog = async () => {
        if (!user) return
        setSaving(true)
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        let newStreak = profile?.streak_count || 0
        const lastLog = profile?.last_log_date

        // Update streak if it's the first log of the day
        if (!todayLog.id) {
            if (lastLog === yesterday) {
                newStreak += 1
            } else if (lastLog !== today) {
                newStreak = 1
            }
        }

        const { data: savedLog, error: logError } = await supabase
            .from('daily_logs')
            .upsert({
                user_id: user.id,
                date: today,
                completed_habits: todayLog.completed_habits,
                notes: todayLog.notes
            }, { onConflict: 'user_id,date' })
            .select()
            .single()

        if (!logError) {
            setTodayLog(prev => ({ ...prev, id: savedLog.id }))

            // Update profile streak
            const { data: newProf } = await supabase
                .from('profiles')
                .update({
                    streak_count: newStreak,
                    last_log_date: today
                })
                .eq('user_id', user.id)
                .select()
                .single()

            if (newProf) setProfile(newProf)
        }
        setSaving(false)
    }

    const typeColors: Record<string, string> = {
        teoría: 'rgba(212,168,83,0.15)',
        práctica: 'rgba(76,175,106,0.15)',
        planificación: 'rgba(100,149,237,0.15)',
        proyecto: 'rgba(232,136,42,0.15)',
        revisión: 'rgba(160,101,42,0.15)',
    }

    // Check if streak is broken (last log was before yesterday)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const today = new Date().toISOString().split('T')[0]
    const isStreakActive = profile?.last_log_date === today || profile?.last_log_date === yesterday
    const displayStreak = isStreakActive ? (profile?.streak_count || 0) : 0

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <h1 className="page-title">⏱️ Hábitos y Racha</h1>
                        <p className="page-subtitle">Construí tu disciplina diaria</p>
                    </div>
                    <div className="streak-badge fade-in">
                        <span style={{ fontSize: '1.5rem' }}>🔥</span>
                        <div>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{displayStreak}</p>
                            <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', opacity: 0.8 }}>Días</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-content" style={{ paddingTop: 0 }}>
                {/* Today's Log Card */}
                <div className="card card-elevated fade-in" style={{ marginBottom: '24px', border: '1px solid var(--accent-gold)' }}>
                    <p style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📅 Registro de Hoy {todayLog.id && <span style={{ color: 'var(--accent-green)', fontSize: '0.7rem' }}>● Guardado</span>}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                        {HABITS.slice(0, 4).map((habit) => {
                            const isDone = todayLog.completed_habits.includes(habit.title)
                            return (
                                <div
                                    key={habit.title}
                                    onClick={() => handleToggleHabit(habit.title)}
                                    className={`habit-check-card ${isDone ? 'active' : ''}`}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{habit.icon}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{habit.title}</span>
                                </div>
                            )
                        })}
                    </div>

                    <textarea
                        className="input-field"
                        placeholder="Notas de hoy (aprendizajes, bloqueos...)"
                        value={todayLog.notes}
                        onChange={(e) => setTodayLog(prev => ({ ...prev, notes: e.target.value }))}
                        style={{ minHeight: '80px', marginBottom: '12px', fontSize: '0.85rem' }}
                    />

                    <button
                        onClick={saveLog}
                        className="btn btn-primary"
                        disabled={saving}
                        style={{ width: '100%' }}
                    >
                        {saving ? 'Guardando...' : '💾 Guardar Registro Diario'}
                    </button>
                </div>

                {/* Tip banner */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(232,136,42,0.04))',
                    border: '1px solid rgba(212,168,83,0.2)',
                    marginBottom: '16px',
                }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        📺 <strong style={{ color: 'var(--accent-gold)' }}>El secreto:</strong> No se trata de eliminar la TV de golpe. Se trata de hacer que ir al taller sea <em>más tentador</em> que la pantalla.
                    </p>
                </div>

                {/* Weekly plan - entre semana */}
                <p className="section-title">📅 Plan Semanal Sugerido</p>
                <div style={{ overflowX: 'auto', display: 'flex', gap: '10px', paddingBottom: '16px', scrollbarWidth: 'none' }}>
                    {WEEKLY_PLAN.semana.concat(WEEKLY_PLAN.finde).map((day, idx) => (
                        <div key={day.day} className="card fade-in" style={{
                            animationDelay: `${idx * 0.04}s`,
                            minWidth: '200px',
                            flexShrink: 0,
                            padding: '12px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: '8px',
                                    background: typeColors[day.tipo] || 'var(--surface-3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                                }}>{day.emoji}</div>
                                <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem' }}>{day.day}</p>
                            </div>
                            {day.activities.map((act, i) => (
                                <p key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {act}</p>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Habits */}
                <p className="section-title" style={{ marginTop: '8px' }}>🧠 Los 6 Mandamientos</p>
                {HABITS.map((habit, idx) => (
                    <div key={idx} className="card fade-in" style={{ animationDelay: `${idx * 0.04}s`, marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '10px',
                                background: 'rgba(212,168,83,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.3rem', flexShrink: 0,
                            }}>{habit.icon}</div>
                            <div>
                                <p style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '2px', fontSize: '0.9rem' }}>{habit.title}</p>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{habit.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Navigation />
        </div>
    )
}
