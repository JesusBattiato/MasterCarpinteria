# Master Carpintería 🪵🪚

App mobile-first de coaching personal para carpinteros, enfocada en la construcción de maestría técnica, hábitos de alto nivel y un negocio rentable de muebles "eternos".

## Tech Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Base de Datos & Auth**: [Supabase](https://supabase.com/)
- **IA Mentor**: [Groq](https://groq.com/) (Llama 3.3-70B)
- **Estilo**: Vanilla CSS (Mobile-first, Wood Dark Theme)

## Funcionalidades
- **Onboarding Diagnóstico**: Adapta el plan a tu experiencia, espacio y presupuesto.
- **Plan de Aprendizaje**: 5 fases estructuradas desde fundamentos hasta profesionalización.
- **Mesa Eterna**: Tracker paso a paso del proyecto central de carpintería.
- **Coach IA**: Chat con mentor exigente para dudas técnicas y accountability.
- **Revisión Semanal**: Formulario de seguimiento con feedback dinámico de IA.
- **Gestión de Hábitos**: Planificador semanal diseñado para reemplazar la TV por el taller.
- **Sección de Negocio**: Estrategias de precios, canales de venta y productos rentables.

## Configuración Local

1. Clonar el repositorio.
2. Instalar dependencias: `npm install`.
3. Configurar variables de entorno en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   GROQ_API_KEY=tu_groq_api_key
   ```
4. Ejecutar el schema SQL en Supabase (`supabase_schema.sql`).
5. Iniciar servidor: `npm run dev`.

## Deploy
Optimizado para despliegue automático en **Vercel** mediante integración con GitHub.
