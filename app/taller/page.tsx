'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

const ZONES = [
    { id: 'Z1', title: 'Z1: Almacenaje Vertical', desc: 'Bajo la escalera. Panel francés + estantes de poca profundidad (18–25 cm).', icon: '🪜' },
    { id: 'Z2', title: 'Z2: Banco Móvil', desc: 'Banco "flaco" (120 × 55 cm) que se guarda bajo el tramo más alto de la escalera.', icon: '🏗️' },
    { id: 'Z3', title: 'Z3: Parqueo de Sierra', desc: 'Carro para sierra de banco (80 × 60 cm) guardado en paralelo a la pared.', icon: '🪚' },
    { id: 'Z4', title: 'Z4: Residuos y Limpieza', desc: 'Set de limpieza (escoba, aspiradora) y bolsa de residuos.', icon: '🧹' },
    { id: 'Z5', title: 'Z5: Zona de Trabajo', desc: 'Al mover el auto, el banco y el carro salen al pasillo alineados longitudinalmente.', icon: '🚗' },
]

const WORKSHOP_PROJECTS = [
    {
        title: 'Proyecto #1: Banco Móvil "Flaco"',
        dims: '120 (L) × 55 (A) × 90 (H) cm',
        materials: ['Pino cepillado 45x45mm (~12m)', 'MDF 18mm + MDF sacrificio', '4 Ruedas con freno'],
        steps: ['Cortes a escuadra', 'Ensamble cola + tornillo', 'Colocar ruedas', 'Tapa de sacrificio'],
    },
    {
        title: 'Proyecto #2: Carro para Sierra',
        dims: '80 (L) × 60 (A) × Altura ajustada',
        materials: ['Pino o MDF 18mm', '4 Ruedas con freno', 'Bisagras piano (extensión)'],
        steps: ['Estructura tipo cajón', 'Ranura para trineo', 'Extensión plegable trasera', 'Regleta con interruptor'],
    },
    {
        title: 'Proyecto #3: Panel Francés',
        dims: '1,5 - 2,0 m x 0,6 m',
        materials: ['Listones MDF 18mm cortados a 45°', 'Tarugos para fijación a pared'],
        steps: ['Corte de listones cleat', 'Fijación nivelada', 'Módulos porta-herramientas'],
    },
]

export default function TallerPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/auth'); return }
            setUser(user)
            setLoading(false)
        }
        init()
    }, [])

    if (loading) return <div className="loading-center"><div className="loading-spinner" /></div>

    return (
        <div className="page-wrapper">
            <div className="page-header">
                <div>
                    <h1 className="page-title">🏗️ Mi Micro-Taller</h1>
                    <p className="page-subtitle">Layout 3.0m x 0.80m (Bajo Escalera)</p>
                </div>
            </div>

            <div className="page-content">
                {/* Concept Card */}
                <div className="card card-elevated" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, var(--wood-dark) 0%, #3d2312 100%)' }}>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                        <strong>Regla de oro:</strong> El taller debe entrar en modo trabajo en <span style={{ color: 'var(--accent-gold)' }}>&lt;2 minutos</span> y guardarse con limpieza en <span style={{ color: 'var(--accent-gold)' }}>&lt;10 minutos</span>.
                    </p>
                </div>

                {/* Zones Section */}
                <p className="section-title">Diseño de Zonas (Layout)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    {ZONES.map((z) => (
                        <div key={z.id} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px' }}>
                            <div style={{ fontSize: '2rem', background: 'var(--surface-3)', width: 50, height: 50, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {z.icon}
                            </div>
                            <div>
                                <p style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: 'var(--accent-gold)' }}>{z.title}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{z.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Build Projects Section */}
                <p className="section-title">Proyectos Obligatorios Estación 1</p>
                {WORKSHOP_PROJECTS.map((p, idx) => (
                    <div key={idx} className="card" style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-primary)', marginBottom: '12px' }}>{p.title}</h3>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-amber)', fontWeight: 700, letterSpacing: '0.5px' }}>Medidas</p>
                                <p style={{ fontSize: '0.85rem' }}>{p.dims}</p>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-amber)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '6px' }}>Materiales Base</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                            {p.materials.map((m, i) => (
                                <span key={i} style={{ fontSize: '0.75rem', background: 'var(--surface-3)', padding: '4px 8px', borderRadius: '4px' }}>{m}</span>
                            ))}
                        </div>

                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-amber)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '6px' }}>Pasos de Construcción</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {p.steps.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem' }}>{i + 1}.</span>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="card" style={{ marginTop: '20px', background: 'rgba(212,168,83,0.05)', border: '1px dashed var(--accent-gold)' }}>
                    <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        ⚠️ <strong>Requisito:</strong> Calibrar el trineo (Sled) a 90º exactos antes de empezar el mobiliario.
                    </p>
                </div>
            </div>
            <Navigation />
        </div>
    )
}
