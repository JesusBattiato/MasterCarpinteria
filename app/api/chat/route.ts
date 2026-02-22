import { NextRequest, NextResponse } from 'next/server'
import { askMentor } from '@/lib/gemini'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
    try {
        const { message, history, profile } = await req.json()
        const supabase = createServerSupabaseClient()

        // Get current user to save suggestions
        const { data: { user } } = await supabase.auth.getUser()

        // Convert history from Gemini format to simple ChatMessage format
        const messages = [
            ...(history || []).map((m: any) => ({
                role: m.role === 'model' ? 'assistant' : m.role,
                content: m.parts?.[0]?.text ?? m.content ?? '',
            })),
            { role: 'user' as const, content: message },
        ]

        const response = await askMentor(messages, profile)

        // Command Extraction Logic
        if (response.includes('COMMAND:') && user) {
            try {
                const commandMatch = response.match(/COMMAND:\s*(\[[\s\S]*\])/)
                if (commandMatch) {
                    const commands = JSON.parse(commandMatch[1])
                    for (const cmd of commands) {
                        // Normalize action types
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
            } catch (cmdError) {
                console.error('Failed to process AI command:', cmdError)
            }
        }

        return NextResponse.json({ response })
    } catch (error: any) {
        console.error('AI error:', error)
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
