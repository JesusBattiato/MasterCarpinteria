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
                const commandRegex = /COMMAND:\s*(\[[\s\S]*?\])/g
                let match
                while ((match = commandRegex.exec(response)) !== null) {
                    try {
                        const commands = JSON.parse(match[1])
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
                        console.error('JSON Parse error in command:', parseErr)
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
