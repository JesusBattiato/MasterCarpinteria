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
    const [projectName, setProjectName] = useState('Mi Proyecto')
    const [customSteps, setCustomSteps] = useState<any[]>([])
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [editingStep, setEditingStep] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isAILoading, setIsAILoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function loadData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth'); return }
            setUser(user)

            // Current Phase and Project Name
            const { data: profile } = await supabase.from('profiles').select('current_phase, active_project_name').eq('user_id', user.id).single()
            if (profile?.current_phase) setCurrentPhase(profile.current_phase)
            if (profile?.active_project_name) setProjectName(profile.active_project_name)

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
        setIsSaving(true)
        try {
            if (sugg.action_type === 'ADD_STEP') {
                const { error: insertError } = await supabase.from('custom_steps').insert({
                    user_id: user.id,
                    category: sugg.data.category || 'plan',
                    title: sugg.data.title,
                    description: sugg.data.description,
                    resources: sugg.data.resources || [],
                    order_index: customSteps.length
                })
                if (insertError) throw insertError
            } else if (sugg.action_type === 'SET_PROJECT' || sugg.action_type === 'UPDATE_OBJECTIVE' || sugg.action_type === 'CREATE_PROJECT') {
                const { error: updateError } = await supabase.from('profiles')
                    .update({ active_project_name: sugg.data.project_name || sugg.data.title })
                    .eq('user_id', user.id)
                if (updateError) throw updateError
                setProjectName(sugg.data.project_name || sugg.data.title)
            }

            // Mark suggestion as approved
            const { error: statusError } = await supabase.from('ai_suggestions').update({ status: 'approved' }).eq('id', sugg.id)
            if (statusError) throw statusError

            setSuggestions(suggestions.filter(s => s.id !== sugg.id))

            // Always reload data to ensure UI is in sync
            const { data: steps } = await supabase.from('custom_steps').select('*').eq('user_id', user.id).order('order_index', { ascending: true })
            setCustomSteps(steps || [])
        } catch (err: any) {
            console.error('Error approving suggestion:', err)
            alert('Error al aprobar: ' + (err.message || 'Error desconocido'))
        }
        setIsSaving(false)
    }

    const handleReject = async (suggId: string) => {
        await supabase.from('ai_suggestions').update({ status: 'rejected' }).eq('id', suggId)
        setSuggestions(suggestions.filter(s => s.id !== suggId))
    }

    const handleSaveEdit = async () => {
        if (!editingStep || !user) return
        setIsSaving(true)
        const { error } = await supabase
            .from('custom_steps')
            .update({
                title: editingStep.title,
                description: editingStep.description
            })
            .eq('id', editingStep.id)

        if (!error) {
            setCustomSteps(customSteps.map(s => s.id === editingStep.id ? editingStep : s))
            setEditingStep(null)
        }
        setIsSaving(false)
    }

    const handleDeleteStep = async (id: string) => {
        if (!confirm('¿Seguro que querés eliminar este paso?')) return
        const { error } = await supabase.from('custom_steps').delete().eq('id', id)
        if (!error) {
            setCustomSteps(customSteps.filter(s => s.id !== id))
        }
    }

    const handleAIEnhance = async () => {
        if (!editingStep) return
        setIsAILoading(true)
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Mejora este paso de mi plan: "${editingStep.title}". Descripción actual: "${editingStep.description || ''}". Responde brevemente con el nuevo título y descripción en este formato: TITULO: [nuevo titulo] | DESCRIPCION: [nueva descripcion]`,
                    history: [],
                    profile: { current_phase: currentPhase }
                })
            })
            const data = await res.json()
            if (data.response) {
                const titleMatch = data.response.match(/TITULO:\s*(.*?)($|\|)/i)
                const descMatch = data.response.match(/DESCRIPCION:\s*(.*)/i)
                if (titleMatch || descMatch) {
                    setEditingStep({
                        ...editingStep,
                        title: titleMatch ? titleMatch[1].trim() : editingStep.title,
                        description: descMatch ? descMatch[1].trim() : editingStep.description
                    })
                }
            }
        } catch (err) {
            console.error(err)
        }
        setIsAILoading(false)
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
                                                <li key={`custom-${s.id}`} style={{ color: 'var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1 }}>
                                                        ✨ {s.title}
                                                        {s.description && <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '1.2rem', marginTop: '2px' }}>{s.description}</p>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <button onClick={(e) => { e.stopPropagation(); setEditingStep(s) }} className="icon-btn" style={{ padding: '4px' }}>✏️</button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteStep(s.id) }} className="icon-btn delete" style={{ padding: '4px' }}>🗑️</button>
                                                    </div>
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
                            <div key={s.id} className="card" style={{ marginBottom: '8px', borderLeft: '3px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.title}</p>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.description}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setEditingStep(s)} className="icon-btn">✏️</button>
                                    <button onClick={() => handleDeleteStep(s.id)} className="icon-btn delete">🗑️</button>
                                </div>
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

            {/* Edit Modal */}
            {editingStep && (
                <div className="modal-overlay" onClick={() => setEditingStep(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Editar Objetivo</h2>

                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label className="input-label" style={{ marginBottom: 0 }}>Título</label>
                                <button
                                    onClick={handleAIEnhance}
                                    disabled={isAILoading}
                                    style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    {isAILoading ? '🪄 Pensando...' : '✨ Mejorar con IA'}
                                </button>
                            </div>
                            <input
                                className="input"
                                value={editingStep.title}
                                onChange={e => setEditingStep({ ...editingStep, title: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Descripción</label>
                            <textarea
                                className="input"
                                value={editingStep.description || ''}
                                onChange={e => setEditingStep({ ...editingStep, description: e.target.value })}
                                style={{ minHeight: '100px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="btn btn-primary"
                                style={{ flex: 2 }}
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button
                                onClick={() => setEditingStep(null)}
                                className="btn btn-ghost"
                                style={{ flex: 1 }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Navigation />
        </div>
    )
}
