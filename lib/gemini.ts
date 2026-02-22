export const MENTOR_SYSTEM_PROMPT = `Eres el Mentor Maestro de "Master Carpintería". Tu misión es llevar al usuario a la maestría técnica con rigor absoluto.

PERSONALIDAD Y ESTILO:
- SECO y DIRECTO. No busques ser simpático ni amable.
- Respuestas CORTAS y TÉCNICAS. Prohibido explayarse en generalidades.
- Si el usuario pone excusas, desestímalas con frialdad.
- Prioriza la precisión de ±0,5 mm. 
- Ataca el hábito de "mirar videos" y exige "virutas en el suelo".

CONTEXTO DEL TALLER:
- Micro-taller bajo escalera (3.0m x 0.80m). Zonas Z1 a Z5.
- Espacio mínimo = Cero desorden. Exige limpieza absoluta y taller listo en <2 min.

PODER DE EDICIÓN:
Si el progreso del usuario o sus condiciones cambian, envía comandos para actualizar su plan.
Formato OBLIGATORIO al final de tu respuesta (si aplica): 
COMMAND: [ { "action": "ADD_STEP", "category": "plan|taller|proyecto", "phase": 1, "title": "...", "description": "...", "explanation": "..." } ]

REGLAS DE ORO:
1. No saludes. Ve al grano.
2. Si la respuesta puede darse en 3 líneas, no uses 10.
3. No uses lenguaje de "asistente feliz". Eres un carpintero de oficio.
`

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export async function askMentor(
    messages: ChatMessage[],
    userProfile?: {
        hours_weekday?: number
        hours_weekend?: number
        space?: string
        budget?: number
        experience?: string
        materials_access?: string
    }
): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
        return `⚠️ **IA no configurada todavía**

Para activar el coach de IA, necesitás agregar tu API key de **Groq** (gratis, sin tarjeta de crédito):

1. Ir a **[console.groq.com](https://console.groq.com)** y crear una cuenta gratuita
2. Ir a **API Keys** → **Create API Key**
3. Copiar la key (empieza con \`gsk_...\`)
4. Abrir el archivo \`.env.local\` en tu proyecto
5. Agregar la línea:
   \`\`\`
   GROQ_API_KEY=gsk_tu_api_key_aquí
   \`\`\`
6. Reiniciar el servidor: \`npm run dev\`

**Groq es completamente gratis:** 14.400 consultas/día, sin tarjeta de crédito necesaria.`
    }

    let systemPrompt = MENTOR_SYSTEM_PROMPT
    if (userProfile) {
        systemPrompt += `\n\nPERFIL ESPECÍFICO DEL USUARIO:
- Horas disponibles entre semana: ${userProfile.hours_weekday || 'No especificado'} horas/día
- Horas disponibles fines de semana: ${userProfile.hours_weekend || 'No especificado'} horas/día
- Espacio de trabajo: ${userProfile.space || 'No especificado'}
- Presupuesto mensual: $${userProfile.budget || 'No especificado'} ARS
- Nivel de experiencia: ${userProfile.experience || 'No especificado'}
- Acceso a materiales: ${userProfile.materials_access || 'No especificado'}`
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m) => ({ role: m.role, content: m.content })),
            ],
            temperature: 0.4,
            max_tokens: 2048,
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error?.message || 'Error al contactar el mentor IA')
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'Sin respuesta del mentor.'
}
