'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default function ProyectoPage() {
    const [stepStatus, setStepStatus] = useState<Record<string | number, boolean>>({})
    const [expandedStep, setExpandedStep] = useState<string | number | null>(null)
    const [user, setUser] = useState<any>(null)
    const [projectName, setProjectName] = useState('Mi Proyecto')
    const [isEditingName, setIsEditingName] = useState(false)
    const [newName, setNewName] = useState('')
    const [allSteps, setAllSteps] = useState<any[]>([])
    const [notes, setNotes] = useState<any[]>([])
    const [newNote, setNewNote] = useState('')
    const [editingStep, setEditingStep] = useState<any>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isAILoading, setIsAILoading] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function loadData() {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (!authUser) { router.push('/auth'); return }
            setUser(authUser)

            // Get profile and active project
            const { data: profile } = await supabase
                .from('profiles')
                .select('active_project_name')
                .eq('user_id', authUser.id)
                .single()

            if (profile?.active_project_name) {
                setProjectName(profile.active_project_name)
                setNewName(profile.active_project_name)
            }

            // Get Project Steps (Template/Fixed)
            const { data: steps } = await supabase
                .from('project_steps')
                .select('*')
                .eq('user_id', authUser.id)
                .eq('project_name', profile?.active_project_name || 'Mesa Eterna')
                .order('step_number', { ascending: true })

            // Get Custom Steps for Project
            const { data: custom } = await supabase
                .from('custom_steps')
                .select('*')
                .eq('user_id', authUser.id)
                .eq('category', 'proyecto')
                .order('order_index', { ascending: true })

            const merged = [
                ...(steps || []).map(s => ({ ...s, id: s.id, is_custom: false })),
                ...(custom || []).map(s => ({ ...s, id: s.id, is_custom: true }))
            ]
            setAllSteps(merged)

            const status: Record<string | number, boolean> = {}
            merged.forEach((s) => {
                status[s.is_custom ? `custom-${s.id}` : s.step_number] = s.completed
            })
            setStepStatus(status)

            // Get Project Notes
            const { data: projNotes } = await supabase
                .from('project_notes')
                .select('*')
                .eq('user_id', authUser.id)
                .eq('project_name', profile?.active_project_name || 'Mesa Eterna')
                .order('created_at', { ascending: false })
            setNotes(projNotes || [])

            setLoading(false)
        }
        loadData()
    }, [])

    const saveProjectName = async () => {
        if (!user) return
        const { error } = await supabase.from('profiles').update({ active_project_name: newName }).eq('user_id', user.id)
        if (!error) {
            setProjectName(newName)
            setIsEditingName(false)
        }
    }

    const toggleStep = async (step: any) => {
        if (!user) return
        const key = step.is_custom ? `custom-${step.id}` : step.step_number
        const newVal = !stepStatus[key]
        setStepStatus((prev) => ({ ...prev, [key]: newVal }))

        if (step.is_custom) {
            await supabase.from('custom_steps').update({ completed: newVal }).eq('id', step.id)
        } else {
            await supabase.from('project_steps').upsert({
                user_id: user.id,
                project_name: projectName,
                step_number: step.step_number,
                completed: newVal,
            }, { onConflict: 'user_id,project_name,step_number' })
        }
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
            setAllSteps(allSteps.map(s => s.id === editingStep.id ? editingStep : s))
            setEditingStep(null)
        }
        setIsSaving(false)
    }

    const handleDeleteStep = async (id: string) => {
        if (!confirm('¿Seguro que querés eliminar este paso?')) return
        const { error } = await supabase.from('custom_steps').delete().eq('id', id)
        if (!error) {
            setAllSteps(allSteps.filter(s => s.id !== id))
        }
    }

    const handleAddNote = async () => {
        if (!newNote.trim() || !user) return
        const { data, error } = await supabase
            .from('project_notes')
            .insert({
                user_id: user.id,
                project_name: projectName,
                content: newNote.trim()
            })
            .select()
            .single()

        if (!error && data) {
            setNotes([data, ...notes])
            setNewNote('')
        }
    }

    const handleToggleNote = async (note: any) => {
        const newVal = !note.is_completed
        setNotes(notes.map(n => n.id === note.id ? { ...n, is_completed: newVal } : n))
        await supabase.from('project_notes').update({ is_completed: newVal }).eq('id', note.id)
    }

    const handleDeleteNote = async (id: string) => {
        setNotes(notes.filter(n => n.id !== id))
        await supabase.from('project_notes').delete().eq('id', id)
    }

    const handleAIEnhance = async () => {
        if (!editingStep) return
        setIsAILoading(true)
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Mejora este paso de mi proyecto "${projectName}": "${editingStep.title}". Descripción actual: "${editingStep.description || ''}". Responde brevemente con el nuevo título y descripción en este formato: TITULO: [nuevo titulo] | DESCRIPCION: [nueva descripcion]`,
                    history: [],
                    profile: { active_project_name: projectName }
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

    const completedCount = Object.values(stepStatus).filter(Boolean).length
    const totalSteps = allSteps.length || 1
    const progress = Math.round((completedCount / totalSteps) * 100)

    return (
        <div className="page-wrapper">
            <div className="page-header" style={{ position: 'relative' }}>
                <div style={{ width: '100%' }}>
                    {isEditingName ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                className="input-field"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}
                            />
                            <button className="btn btn-primary" onClick={saveProjectName} style={{ padding: '8px 12px' }}>✓</button>
                            <button className="btn btn-secondary" onClick={() => setIsEditingName(false)} style={{ padding: '8px 12px' }}>✕</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 className="page-title">🏗️ {projectName}</h1>
                                <p className="page-subtitle">Seguimiento de construcción</p>
                            </div>
                            <button
                                onClick={() => setIsEditingName(true)}
                                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6 }}
                            >
                                ✏️
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="page-content" style={{ paddingTop: 0 }}>
                {/* Progress Banner */}
                <div className="card card-elevated" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                            <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>
                                Progreso del proyecto
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {completedCount} de {totalSteps} pasos completados
                            </p>
                        </div>
                        <span style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                            {progress}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Project Notes Section */}
                <p className="section-title">📌 Notas y Recordatorios</p>
                <div className="card fade-in" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input
                            className="input"
                            placeholder="Ej: Comprar clavos 3/4..."
                            value={newNote}
                            onChange={e => setNewNote(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                            style={{ padding: '10px 14px', fontSize: '0.85rem' }}
                        />
                        <button onClick={handleAddNote} className="btn btn-primary" style={{ width: '44px', padding: 0 }}>+</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notes.length === 0 ? (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>No hay notas todavía.</p>
                        ) : (
                            notes.map(note => (
                                <div key={note.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div
                                        className={`check-box ${note.is_completed ? 'checked' : ''}`}
                                        onClick={() => handleToggleNote(note)}
                                        style={{ width: '18px', height: '18px', minWidth: '18px' }}
                                    />
                                    <p style={{
                                        flex: 1,
                                        fontSize: '0.85rem',
                                        textDecoration: note.is_completed ? 'line-through' : 'none',
                                        color: note.is_completed ? 'var(--text-muted)' : 'var(--text-primary)'
                                    }}>
                                        {note.content}
                                    </p>
                                    <button onClick={() => handleDeleteNote(note.id)} style={{ opacity: 0.5, fontSize: '0.8rem' }}>🗑️</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Steps */}
                <p className="section-title">Pasos a seguir</p>
                <div className="step-track">
                    {allSteps.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                No hay pasos definidos para este proyecto.<br />
                                <strong>Habla con el Mentor</strong> para planificar la {projectName}.
                            </p>
                            <button onClick={() => router.push('/chat')} className="btn btn-primary" style={{ marginTop: '16px' }}>
                                🤖 Planificar con Mentor
                            </button>
                        </div>
                    ) : (
                        allSteps.map((step, idx) => {
                            const stepId = step.is_custom ? `custom-${step.id}` : step.step_number
                            const done = !!stepStatus[stepId]
                            const isExpanded = expandedStep === stepId

                            return (
                                <div key={stepId} className="step-item">
                                    <div className="step-line">
                                        <div className={`step-circle ${done ? 'done' : 'active'}`}>
                                            {done ? '✓' : step.icon || (idx + 1)}
                                        </div>
                                        {idx < allSteps.length - 1 && <div className="step-connector" style={{ background: done ? 'var(--accent-green)' : 'var(--border)' }} />}
                                    </div>

                                    <div className="step-content">
                                        <div style={{ cursor: 'pointer' }} onClick={() => setExpandedStep(isExpanded ? null : stepId)}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <p className="step-title" style={{ color: done ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                                                    {step.title}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {step.is_custom && (
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            <button onClick={(e) => { e.stopPropagation(); setEditingStep(step) }} className="icon-btn" style={{ fontSize: '0.7rem', width: '24px', height: '24px' }}>✏️</button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteStep(step.id) }} className="icon-btn delete" style={{ fontSize: '0.7rem', width: '24px', height: '24px' }}>🗑️</button>
                                                        </div>
                                                    )}
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{isExpanded ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                {step.description}
                                            </p>
                                        </div>

                                        {isExpanded && (
                                            <div className="fade-in" style={{ marginTop: '12px' }}>
                                                <div className="card" style={{ padding: '12px' }}>
                                                    {step.resources && step.resources.length > 0 && (
                                                        <div style={{ marginBottom: '16px' }}>
                                                            <p className="section-title" style={{ color: 'var(--accent-gold)' }}>🎥 Recursos y Videos</p>
                                                            {step.resources.map((res: any, i: number) => (
                                                                <a
                                                                    key={i}
                                                                    href={res.url.startsWith('http') ? res.url : `https://www.youtube.com/results?search_query=${encodeURIComponent(res.url)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="card"
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        padding: '10px',
                                                                        marginBottom: '6px',
                                                                        textDecoration: 'none',
                                                                        border: '1px solid var(--border)'
                                                                    }}
                                                                >
                                                                    <span style={{ fontSize: '1.2rem' }}>📺</span>
                                                                    <div style={{ flex: 1 }}>
                                                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{res.title}</p>
                                                                        <p style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>Ver en YouTube →</p>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <button
                                                        className={`btn ${done ? 'btn-ghost' : 'btn-primary'}`}
                                                        onClick={() => toggleStep(step)}
                                                        style={{ width: '100%' }}
                                                    >
                                                        {done ? '↩ Marcar como pendiente' : '✓ Marcar como terminado'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingStep && (
                <div className="modal-overlay" onClick={() => setEditingStep(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Editar Paso</h2>

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
