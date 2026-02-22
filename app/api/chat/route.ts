import { NextRequest, NextResponse } from 'next/server'
import { askMentor } from '@/lib/gemini'

export async function POST(req: NextRequest) {
    try {
        const { message, history, profile } = await req.json()

        // Convert history from Gemini format to simple ChatMessage format
        const messages = [
            ...(history || []).map((m: any) => ({
                role: m.role === 'model' ? 'assistant' : m.role,
                content: m.parts?.[0]?.text ?? m.content ?? '',
            })),
            { role: 'user' as const, content: message },
        ]

        const response = await askMentor(messages, profile)
        return NextResponse.json({ response })
    } catch (error: any) {
        console.error('AI error:', error)
        return NextResponse.json(
            { error: error.message || 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
