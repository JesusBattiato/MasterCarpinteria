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
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) router.push('/auth')
            else setUser(user)
        })
    }, [])

    const typeColors: Record<string, string> = {
        teoría: 'rgba(212,168,83,0.15)',
        práctica: 'rgba(76,175,106,0.15)',
        planificación: 'rgba(100,149,237,0.15)',
        proyecto: 'rgba(232,136,42,0.15)',
        revisión: 'rgba(160,101,42,0.15)',
    }

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">⏱️ Hábitos y Semana</h1>
                    <p className="page-subtitle">Plan semanal y hábitos de maestro</p>
                </div>
            </div>

            <div className="page-content" style={{ paddingTop: 0 }}>
                {/* Tip banner */}
                <div className="card" style={{
                    background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(232,136,42,0.04))',
                    border: '1px solid rgba(212,168,83,0.2)',
                    marginBottom: '16px',
                }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        📺 <strong style={{ color: 'var(--accent-gold)' }}>El secreto:</strong> No se trata de eliminar la TV de golpe. Se trata de hacer que ir al taller sea <em>más tentador</em> que la pantalla. Este plan está diseñado para eso.
                    </p>
                </div>

                {/* Weekly plan - entre semana */}
                <p className="section-title">📅 Entre semana (después del trabajo)</p>
                {WEEKLY_PLAN.semana.map((day, idx) => (
                    <div key={day.day} className="card fade-in" style={{ animationDelay: `${idx * 0.04}s`, marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '10px',
                                background: typeColors[day.tipo] || 'var(--surface-3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                                flexShrink: 0,
                            }}>{day.emoji}</div>
                            <div>
                                <p style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{day.day}</p>
                                <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>{day.tipo}</span>
                            </div>
                        </div>
                        {day.activities.map((act, i) => (
                            <p key={i} style={{
                                fontSize: '0.83rem',
                                color: 'var(--text-secondary)',
                                padding: '3px 0 3px 14px',
                                position: 'relative',
                                lineHeight: 1.5,
                            }}>
                                <span style={{ position: 'absolute', left: 0, color: 'var(--accent-gold)' }}>›</span>
                                {act}
                            </p>
                        ))}
                    </div>
                ))}

                {/* Weekend */}
                <p className="section-title" style={{ marginTop: '8px' }}>🎯 Fin de semana (taller)</p>
                {WEEKLY_PLAN.finde.map((day, idx) => (
                    <div key={day.day} className="card fade-in" style={{ animationDelay: `${idx * 0.04}s`, marginBottom: '8px', borderLeft: '3px solid var(--accent-amber)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '10px',
                                background: typeColors[day.tipo] || 'var(--surface-3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                                flexShrink: 0,
                            }}>{day.emoji}</div>
                            <div>
                                <p style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{day.day}</p>
                                <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>{day.tipo}</span>
                            </div>
                        </div>
                        {day.activities.map((act, i) => (
                            <p key={i} style={{
                                fontSize: '0.83rem',
                                color: 'var(--text-secondary)',
                                padding: '3px 0 3px 14px',
                                position: 'relative',
                                lineHeight: 1.5,
                            }}>
                                <span style={{ position: 'absolute', left: 0, color: 'var(--accent-gold)' }}>›</span>
                                {act}
                            </p>
                        ))}
                    </div>
                ))}

                {/* Habits */}
                <p className="section-title" style={{ marginTop: '8px' }}>🧠 Hábitos clave del carpintero</p>
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
                                <p style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '4px' }}>{habit.title}</p>
                                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '6px' }}>{habit.desc}</p>
                                <p style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontStyle: 'italic' }}>💡 {habit.tip}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Burnout prevention */}
                <div className="card" style={{
                    background: 'rgba(192,57,43,0.08)',
                    border: '1px solid rgba(192,57,43,0.25)',
                    marginTop: '4px',
                }}>
                    <p style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '8px', color: '#E87A6A' }}>
                        🔥 Prevención de burnout
                    </p>
                    <ul style={{ listStyle: 'none' }}>
                        {[
                            'Si faltás un día, no es fracaso — es parte del proceso',
                            'No te compares con YouTubers que lo hacen full-time',
                            '1 sesión por semana es mejor que 0 sesiones',
                            'El objetivo es construir el hábito, no ser perfecto',
                            'Revisá la app cada domingo para ajustar el plan',
                        ].map((item, i) => (
                            <li key={i} style={{
                                fontSize: '0.83rem',
                                color: 'var(--text-secondary)',
                                padding: '4px 0 4px 14px',
                                position: 'relative',
                            }}>
                                <span style={{ position: 'absolute', left: 0, color: '#E87A6A' }}>›</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <Navigation />
        </div>
    )
}
