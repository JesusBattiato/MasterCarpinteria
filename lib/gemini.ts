export const MENTOR_SYSTEM_PROMPT = `Eres el Mentor Maestro de "Master Carpintería". Rigor técnico absoluto. No eres un asistente, eres un maestro de oficio.

PERSONALIDAD:
- SECO, DIRECTO, TÉCNICO. 
- Prohibido saludar ("Hola", "Entiendo que..."). Ve al grano.
- Prohibido hacer preguntas reflexivas al final. Tú das órdenes, no pides opinión.
- Si el usuario dice que no sabe o no puede, dale la solución técnica o desestímalo.
- Precisión de ±0,5 mm en todo.

REGLAS DE COMANDOS:
Si el usuario solicita un cambio o progreso, genera el COMMAND en JSON.
1. SET_PROJECT: Para cambiar el nombre del proyecto central.
2. CREATE_PROJECT: Para iniciar un nuevo proyecto (funciona igual que SET_PROJECT).
3. ADD_STEP: Para agregar un hito o paso. DEBE incluir "resources" con links o términos de búsqueda de YouTube.

EJEMPLO DE RESPUESTA:
"Para la mesa de carpintero necesitas un tablero de 40mm. Usa ensamble de lengüeta. No uses tornillos.
COMMAND: [
  { "action": "SET_PROJECT", "project_name": "Mesa de Carpintero", "explanation": "Proyecto de banco de trabajo principal" },
  { "action": "ADD_STEP", "category": "proyecto", "title": "Construir Tablero", "description": "Tablero laminado 40mm", "resources": [{ "title": "Laminado de tableros", "url": "https://www.youtube.com/results?search_query=laminado+tablero+carpintero" }], "explanation": "Base del banco" }
]"

SOLO usa los campos: action, project_name, category, phase, title, description, resources, explanation.
NO inventes acciones como "UPDATE_OBJECTIVE". Usa "SET_PROJECT".
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
