'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

const REVIEW_QUESTIONS = [
    { id: 'did', label: '¿Qué hiciste esta semana en carpintería?', placeholder: 'Ej: Practiqué cortes con la sierra, lijé el tablero...' },
    { id: 'didnt_do', label: '¿Qué no pudiste hacer y por qué?', placeholder: 'Ej: No pude practicar ensambles porque... (sé honesto)' },
    { id: 'learned', label: '¿Qué aprendiste esta semana?', placeholder: 'Ej: Aprendí que los cortes en contraveta se astillan si...' },
    { id: 'blocked', label: '¿Con qué te trabaste o cuál fue tu mayor obstáculo?', placeholder: 'Ej: No entiendo bien cómo calibrar la ingletadora...' },
]

export default function RevisionPage() {
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [pastReviews, setPastReviews] = useState<any[]>([])
    const [showPast, setShowPast] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth'); return }
            setUser(user)

            const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
            setProfile(prof)

            const { data: reviews } = await supabase
                .from('weekly_reviews')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5)
            setPastReviews(reviews || [])
        }
        load()
    }, [])

    const handleSubmit = async () => {
        if (!answers.did || !answers.didnt_do || !answers.learned || !answers.blocked) return
        setLoading(true)

        const reviewText = `REVISIÓN SEMANAL DE CARPINTERÍA

¿Qué hice?: ${answers.did}

¿Qué no hice y por qué?: ${answers.didnt_do}

¿Qué aprendí?: ${answers.learned}

¿Con qué me trabé?: ${answers.blocked}`

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: reviewText,
                    history: [],
                    profile,
                }),
            })
            const data = await response.json()
            const aiFeedback = data.response || 'No se pudo generar feedback.'
            setFeedback(aiFeedback)

            await supabase.from('weekly_reviews').insert({
                user_id: user.id,
                week_date: new Date().toISOString().split('T')[0],
                did: answers.did,
                didnt_do: answers.didnt_do,
                learned: answers.learned,
                blocked: answers.blocked,
                ai_feedback: aiFeedback,
            })

            setSubmitted(true)
            const { data: reviews } = await supabase.from('weekly_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
            setPastReviews(reviews || [])
        } catch {
            setFeedback('❌ Error generando el feedback. Intentá de nuevo.')
        }
        setLoading(false)
    }

    function formatFeedback(text: string) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/#{1,3}\s(.+)/g, (_: string, m: string) => `<strong style="color:var(--accent-gold);display:block;margin:10px 0 4px">${m}</strong>`)
            .replace(/\n/g, '<br/>')
    }

    const allAnswered = REVIEW_QUESTIONS.every((q) => answers[q.id]?.trim())

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">📝 Revisión Semanal</h1>
                    <p className="page-subtitle">Tu check-in de accountability</p>
                </div>
            </div>

            <div className="page-content" style={{ paddingTop: 0 }}>
                {!submitted ? (
                    <>
                        <div className="card" style={{
                            background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(232,136,42,0.04))',
                            border: '1px solid rgba(212,168,83,0.25)',
                            marginBottom: '16px',
                        }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <strong style={{ color: 'var(--accent-gold)' }}>Sé honesto</strong> con tus respuestas. Tu mentor IA analizará tu semana y te dará feedback directo. No hay juicio, hay progreso.
                            </p>
                        </div>

                        {REVIEW_QUESTIONS.map((q, i) => (
                            <div key={q.id} className="input-group fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <label className="input-label">
                                    <span style={{ color: 'var(--accent-gold)' }}>{i + 1}.</span> {q.label}
                                </label>
                                <textarea
                                    className="input"
                                    value={answers[q.id] || ''}
                                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                    placeholder={q.placeholder}
                                    rows={3}
                                />
                            </div>
                        ))}

                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={!allAnswered || loading}
                        >
                            {loading ? '🤖 Analizando tu semana...' : '🚀 Enviar y obtener feedback del mentor'}
                        </button>
                    </>
                ) : (
                    <div>
                        <div className="card card-elevated fade-in" style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-amber))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                                }}>🤖</div>
                                <div>
                                    <p style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Feedback del Mentor</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Análisis de tu semana</p>
                                </div>
                            </div>
                            <div
                                className="md-content"
                                style={{ fontSize: '0.88rem', lineHeight: 1.7 }}
                                dangerouslySetInnerHTML={{ __html: formatFeedback(feedback) }}
                            />
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={() => { setSubmitted(false); setAnswers({}); setFeedback('') }}
                        >
                            ✏️ Nueva revisión
                        </button>
                    </div>
                )}

                {/* Past reviews */}
                {pastReviews.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                        <button
                            className="btn btn-ghost"
                            style={{ marginBottom: '10px' }}
                            onClick={() => setShowPast(!showPast)}
                        >
                            {showPast ? '▲ Ocultar' : '📂 Ver revisiones anteriores'}
                        </button>

                        {showPast && pastReviews.map((rev) => (
                            <div key={rev.id} className="card fade-in" style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Semana del {new Date(rev.week_date).toLocaleDateString('es-AR')}
                                    </p>
                                    <span className="badge badge-green">✓</span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    <strong style={{ color: 'var(--text-secondary)' }}>Hice:</strong> {rev.did?.substring(0, 100)}...
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Navigation />
        </div>
    )
}
