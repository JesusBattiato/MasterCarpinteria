'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

const BUSINESS_SECTIONS = [
    {
        id: 'productos',
        icon: '🪑',
        title: 'Tipos de productos',
        items: [
            {
                name: '🎯 Muebles por encargo (a medida)',
                pros: 'Mayor precio, personalización total, trabajo con clientes ideales',
                cons: 'Más tiempo de venta, requiere más habilidad técnica',
                stars: 4,
                when: 'Cuando ya tenés 3-4 proyectos en portafolio',
            },
            {
                name: '📦 Línea estándar de productos',
                pros: 'Flujo de trabajo repetible, más eficiente, más fácil de vender online',
                cons: 'Menos margen por pieza, requiere inversión inicial',
                stars: 5,
                when: 'Empezar con 1-2 productos estrella en distintos tamaños',
            },
            {
                name: '✂️ Artículos pequeños',
                pros: 'Rápidos de hacer, excelente para aprender, muy rentables por hora',
                cons: 'Volumen alto necesario para ingreso significativo',
                stars: 3,
                when: 'Ideal para empezar y generar flujo de caja rápido',
            },
        ],
    },
    {
        id: 'primeros',
        icon: '🚀',
        title: 'Primeros productos recomendados',
        desc: 'Alta rentabilidad + no demasiada complejidad + alta percepción de calidad:',
        products: [
            { name: 'Mesa ratona/café', price: '$80.000–$150.000', complexity: 'Media', roi: '⭐⭐⭐⭐⭐' },
            { name: 'Banco/taburete', price: '$40.000–$80.000', complexity: 'Baja-media', roi: '⭐⭐⭐⭐⭐' },
            { name: 'Repisa flotante', price: '$25.000–$60.000', complexity: 'Baja', roi: '⭐⭐⭐⭐' },
            { name: 'Mesa escritorio', price: '$120.000–$250.000', complexity: 'Media-alta', roi: '⭐⭐⭐⭐' },
            { name: 'Tabla de cocina premium', price: '$20.000–$50.000', complexity: 'Baja', roi: '⭐⭐⭐' },
        ],
    },
    {
        id: 'canales',
        icon: '📢',
        title: 'Canales de venta',
        channels: [
            { name: 'Instagram/TikTok', icon: '📸', desc: 'Mostrar el proceso. El video del "antes y después" vende solo. Postear 3-4 veces por semana.' },
            { name: 'MercadoLibre', icon: '🛒', desc: 'Para artículos estándar. Alta visibilidad pero comisión alta. Empreza con 1-2 productos.' },
            { name: 'Boca a boca', icon: '👥', desc: 'Las primeras 5-10 ventas van a venir de conocidos. No subestimes esto.' },
            { name: 'WhatsApp Business', icon: '💬', desc: 'Catálogo con fotos, precios orientativos y estado de disponibilidad.' },
            { name: 'Diseñadores de interiores', icon: '🏠', desc: 'Un buen cliente referido puede darte 5-10 proyectos. Contactar decoradores locales.' },
            { name: 'Marketplace local', icon: '📍', desc: 'Grupos de FB de tu zona, OLX, ferias de diseño. Muy bueno para empezar.' },
        ],
    },
    {
        id: 'precio',
        icon: '💰',
        title: 'Cómo fijar precios',
        steps: [
            { n: 1, label: 'Costos directos', desc: 'Madera + tornillos + cola + lija + acabado + packaging' },
            { n: 2, label: 'Tu tiempo', desc: 'Horas trabajadas × tu valor hora (mínimo $1.500-2.000/h ARS)' },
            { n: 3, label: 'Overhead', desc: 'Electricidad, desgaste de herramientas, traslado (20% de total)' },
            { n: 4, label: 'Margen de ganancia', desc: 'Mínimo 30-40% sobre el costo total' },
            { n: 5, label: 'Precio de mercado', desc: 'Investigar qué cobra la competencia. No regalen su trabajo.' },
        ],
        formula: '(Mat + Tiempo + Overhead) × 1.35 = Precio mínimo',
    },
    {
        id: 'estrategia',
        icon: '📈',
        title: 'Estrategia para empezar (sin dejar el trabajo)',
        phases: [
            { phase: 'Mes 1-3', title: 'Portafolio', desc: 'Construí 3 piezas de alta calidad. Cada una fotograf\u00edala profesionalmente. Regalá o vendé a costo a gente de confianza para tener reseñas.' },
            { phase: 'Mes 4-6', title: 'Primera venta real', desc: 'Publicá tus productos en Instagram + MercadoLibre. Objetivo: 1-2 ventas reales. Reinvertí en materiales.' },
            { phase: 'Mes 7-12', title: 'Validación', desc: 'Si llegás a $50.000-100.000 ARS de facturación mensual extra, empezás a validar el negocio. Especializ\u00e1te en 2-3 productos.' },
            { phase: 'Año 2+', title: 'Escala', desc: 'Con el modelo validado, decidís si ampliar el taller, subir precios o empezar a reducir horas en el trabajo actual.' },
        ],
    },
]

export default function NegocioPage() {
    const [activeSection, setActiveSection] = useState<string | null>('primeros')
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) router.push('/auth')
            else setUser(user)
        })
    }, [])

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">💼 Mi Negocio</h1>
                    <p className="page-subtitle">Estrategia para vender muebles de calidad</p>
                </div>
            </div>

            <div className="page-content" style={{ paddingTop: 0 }}>
                {/* Mantra */}
                <div className="card card-elevated" style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '6px' }}>🎯</p>
                    <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-gold)' }}>
                        "Muebles eternos, no descartables"
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Tu diferencial es la calidad, durabilidad y carácter. Nunca compitas por precio con IKEA.
                    </p>
                </div>

                <p className="section-title">Productos para Lote Inicial (Rotación Rápida)</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '32px' }}>
                    {[
                        {
                            title: 'A. Tabla de Cocina Maciza',
                            desc: '400 x 250 x 25 mm. Pino o eucalipto seleccionado.',
                            icon: '🥩',
                            details: 'Listones pegados a canto con PVA D3. Acabado: Aceite mineral + cera.',
                            steps: 'Cortes repetitivos → Encolado → Lijado pro 180 → Chaflán 45º.'
                        },
                        {
                            title: 'B. Estante Flotante',
                            desc: '800 x 200 x 30 mm. Pino seleccionado.',
                            icon: '🖼️',
                            details: 'Incluye varillas roscadas M8 o soportes comerciales.',
                            steps: 'Corte precisión ±0,5mm → Perforación trasera → 3 manos poliuretano aqua.'
                        },
                        {
                            title: 'C. Banco Pequeño Minimalista',
                            desc: '450 x 250 x 450 mm. Estructural y estético.',
                            icon: '🪑',
                            details: 'Ensamble de espiga falsa con fresado o tornillo oculto.',
                            steps: 'Marcado con cuchillo → Caja y espiga → Patas 45x45 → Aceite duro.'
                        },
                    ].map((p, i) => (
                        <div key={i} className="card fade-in" style={{ borderLeft: '3px solid var(--accent-gold)' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.5rem' }}>{p.icon}</span>
                                <p style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{p.title}</p>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{p.desc}</p>
                            <div style={{ background: 'var(--surface-3)', padding: '8px', borderRadius: '8px', fontSize: '0.78rem' }}>
                                <p style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>Técnica:</p>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{p.details}</p>
                                <p style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>Clave paso a paso:</p>
                                <p style={{ color: 'var(--text-muted)' }}>{p.steps}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {BUSINESS_SECTIONS.map((section, sIdx) => {
                    const isOpen = activeSection === section.id
                    return (
                        <div key={section.id} className="card fade-in" style={{ animationDelay: `${sIdx * 0.05}s`, marginBottom: '10px' }}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                onClick={() => setActiveSection(isOpen ? null : section.id)}
                            >
                                <span style={{ fontSize: '1.4rem' }}>{section.icon}</span>
                                <p style={{ fontFamily: 'Outfit', fontWeight: 700, flex: 1 }}>{section.title}</p>
                                <span style={{ color: 'var(--text-muted)' }}>{isOpen ? '▲' : '▼'}</span>
                            </div>

                            {isOpen && (
                                <div style={{ marginTop: '14px' }}>
                                    {/* Productos */}
                                    {section.items && section.items.map((item, i) => (
                                        <div key={i} className="card" style={{ marginBottom: '8px', padding: '12px' }}>
                                            <p style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '6px' }}>{item.name}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--accent-green)', marginBottom: '2px' }}>✓ {item.pros}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>✗ {item.cons}</p>
                                            <p style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontStyle: 'italic' }}>⏰ {item.when}</p>
                                        </div>
                                    ))}

                                    {/* Primeros productos */}
                                    {section.products && (
                                        <>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>{section.desc}</p>
                                            {section.products.map((prod, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <div>
                                                        <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.9rem' }}>{prod.name}</p>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complejidad: {prod.complexity}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ fontSize: '0.82rem', color: 'var(--accent-green)', fontWeight: 600 }}>{prod.price}</p>
                                                        <p style={{ fontSize: '0.75rem' }}>{prod.roi}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* Canales */}
                                    {section.channels && section.channels.map((ch, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                            <span style={{ fontSize: '1.3rem', width: '28px', textAlign: 'center', flexShrink: 0 }}>{ch.icon}</span>
                                            <div>
                                                <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.88rem' }}>{ch.name}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '2px' }}>{ch.desc}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Precio */}
                                    {section.steps && (
                                        <>
                                            {section.steps.map((step) => (
                                                <div key={step.n} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                                    <div style={{
                                                        width: 24, height: 24, borderRadius: '50%',
                                                        background: 'var(--accent-gold)', color: 'var(--wood-deep)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '1px',
                                                    }}>{step.n}</div>
                                                    <div>
                                                        <p style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.88rem' }}>{step.label}</p>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '2px' }}>{step.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(212,168,83,0.1)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fórmula básica</p>
                                                <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-gold)', marginTop: '4px' }}>{section.formula}</p>
                                            </div>
                                        </>
                                    )}

                                    {/* Estrategia por fases */}
                                    {section.phases && section.phases.map((ph, i) => (
                                        <div key={i} className="card" style={{ marginBottom: '8px', padding: '12px', borderLeft: '3px solid var(--accent-gold)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.9rem' }}>{ph.title}</p>
                                                <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>{ph.phase}</span>
                                            </div>
                                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ph.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}

                <div className="card" style={{ background: 'rgba(76,175,106,0.08)', border: '1px solid rgba(76,175,106,0.25)', marginTop: '4px' }}>
                    <p style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '6px', color: 'var(--accent-green)' }}>💡 Regla de oro</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Un mueble bien hecho, fotografiado con buena luz y una descripción que explique por qué es durable y especial, vale <strong style={{ color: 'var(--text-primary)' }}>3 veces más</strong> que el mismo mueble sin esa historia. Vendés calidad y permanencia, no madera.
                    </p>
                </div>
            </div>
            <Navigation />
        </div>
    )
}
