'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
}

function formatMessage(text: string) {
    // Simple markdown-like formatting
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/#{1,3}\s(.+)/g, (_: string, m: string) => `<strong style="color:var(--accent-gold);font-size:1rem;display:block;margin:8px 0 4px">${m}</strong>`)
        .replace(/\n/g, '<br/>')
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth'); return }
            setUser(user)

            const { data: prof } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()
            setProfile(prof)

            const { data: msgs } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(50)

            if (msgs && msgs.length > 0) {
                setMessages(msgs)
            } else {
                // Welcome message
                const welcome: Message = {
                    id: 'welcome',
                    role: 'assistant',
                    content: `¡Bienvenido a tu sesión de coaching! 🪵\n\nSoy tu mentor de carpintería. Estoy aquí para ayudarte a:\n\n**• Desarrollar tus habilidades** de carpintería de forma sistemática\n**• Mantenerte enfocado** y accountable\n**• Responder dudas técnicas** sobre técnicas, materiales y herramientas\n**• Planificar tu negocio** de muebles de alta calidad\n\nEscribí "**Revisión semanal de carpintería**" para hacer tu check-in semanal con accountability.\n\n¿En qué te puedo ayudar hoy?`,
                    created_at: new Date().toISOString(),
                }
                setMessages([welcome])
            }
            setInitializing(false)
        }
        init()
    }, [])

    useEffect(() => {
        if (initializing) return
        bottomRef.current?.scrollIntoView({ behavior: 'auto' })
    }, [messages, loading, initializing])

    const sendMessage = async () => {
        if (!input.trim() || loading || !user) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            created_at: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, userMsg])
        setInput('')
        setLoading(true)

        // Save user message
        await supabase.from('chat_messages').insert({
            user_id: user.id,
            role: 'user',
            content: userMsg.content,
        })

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    history: messages.filter((m) => m.id !== 'welcome').map((m) => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }],
                    })),
                    profile,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || `Error del servidor (${response.status})`)
            }

            const aiContent = data.response
            if (!aiContent) {
                throw new Error('El mentor no devolvió ninguna respuesta.')
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent,
                created_at: new Date().toISOString(),
            }

            setMessages((prev) => [...prev, aiMsg])

            // Save AI message
            await supabase.from('chat_messages').insert({
                user_id: user.id,
                role: 'assistant',
                content: aiContent,
            })
        } catch (err: any) {
            const errMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `❌ **Error del Mentor:** ${err.message || 'Error de conexión'}. Intentá de nuevo.`,
                created_at: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, errMsg])
        }

        setLoading(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    if (initializing) return (
        <div className="loading-center"><div className="loading-spinner" /></div>
    )

    return (
        <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid var(--border)',
                background: 'rgba(26,15,8,0.95)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-gold), var(--accent-amber))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', flexShrink: 0,
                }}>🤖</div>
                <div>
                    <p style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Mentor IA</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--accent-green)' }}>● Activo · Groq / Llama 3.3-70b</p>
                </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '8px' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '12px',
                    }}>
                        <div
                            className={`chat-bubble ${msg.role}`}
                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                        />
                        <span className="chat-time">
                            {new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}

                {loading && (
                    <div style={{ marginBottom: '12px' }}>
                        <div className="typing-indicator">
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                            <div className="typing-dot" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            <div style={{
                padding: '8px 16px',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
            }}>
                {[
                    'Revisión semanal de carpintería',
                    '¿Qué practico esta semana?',
                    '¿Cómo empiezo la mesa?',
                    'Consejo sobre acabados',
                ].map((prompt) => (
                    <button
                        key={prompt}
                        onClick={() => { setInput(prompt); inputRef.current?.focus() }}
                        style={{
                            whiteSpace: 'nowrap',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: '1px solid var(--border-active)',
                            background: 'var(--surface-2)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            flexShrink: 0,
                        }}
                    >
                        {prompt}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div style={{
                padding: '8px 12px 12px',
                borderTop: '1px solid var(--border)',
                background: 'rgba(26,15,8,0.95)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-end',
            }}>
                <textarea
                    ref={inputRef}
                    className="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Preguntale algo al mentor..."
                    rows={1}
                    style={{
                        resize: 'none',
                        minHeight: '44px',
                        maxHeight: '120px',
                        flex: 1,
                        padding: '10px 14px',
                        lineHeight: 1.4,
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    style={{
                        width: 44, height: 44, borderRadius: '12px',
                        background: input.trim() && !loading
                            ? 'linear-gradient(135deg, var(--accent-gold), var(--accent-amber))'
                            : 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem',
                        transition: 'var(--transition)',
                        flexShrink: 0,
                    }}
                >
                    {loading ? '⏳' : '↑'}
                </button>
            </div>

            <Navigation />
        </div>
    )
}
