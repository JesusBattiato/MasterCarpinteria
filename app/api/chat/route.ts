import { NextRequest, NextResponse } from 'next/server'
import { askMentor } from '@/lib/gemini'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
    try {
        const { message, history, profile } = await req.json()
        const supabase = createServerSupabaseClient()

        // Get current user safely
        const { data: authData } = await supabase.auth.getUser()
        const user = authData?.user

        // Convert history for AI (Limit to last 10 messages to avoid TPM limits)
        const messages = [
            ...(history || []).slice(-10).map((m: any) => ({
                role: m.role === 'model' ? 'assistant' : m.role,
                content: m.parts?.[0]?.text ?? m.content ?? '',
            })),
            { role: 'user' as const, content: message },
        ]

        let response: string
        try {
            response = await askMentor(messages, profile)
        } catch (aiErr: any) {
            console.error('Groq API Error:', aiErr)
            return NextResponse.json({ error: aiErr.message }, { status: 500 })
        }

        // Processing commands in the background/separately so we don't crash the response
        if (response.includes('COMMAND:') && user) {
            try {
                // Find all markers and extract until the next marker or end
                const parts = response.split('COMMAND:')
                for (let i = 1; i < parts.length; i++) {
                    const block = parts[i].trim()
                    // Find the outermost JSON array starting with [ and ending with ]
                    const startIdx = block.indexOf('[')
                    const endIdx = block.lastIndexOf(']')

                    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                        try {
                            const jsonStr = block.substring(startIdx, endIdx + 1)
                            const commands = JSON.parse(jsonStr)
                            if (Array.isArray(commands)) {
                                for (const cmd of commands) {
                                    let action = cmd.action
                                    if (action === 'UPDATE_OBJECTIVE') action = 'SET_PROJECT'

                                    await supabase.from('ai_suggestions').insert({
                                        user_id: user.id,
                                        action_type: action,
                                        data: cmd,
                                        explanation: cmd.explanation || 'Sugerido por el Mentor',
                                    })
                                }
                            }
                        } catch (parseErr) {
                            console.error('JSON Parse error in block:', parseErr)
                        }
                    }
                }
            } catch (cmdErr) {
                console.error('Command processing error:', cmdErr)
            }
        }

        return NextResponse.json({ response })
    } catch (error: any) {
        console.error('Fatal Chat Route Error:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
