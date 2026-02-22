export const LEARNING_PHASES = [
    {
        id: 1,
        title: 'Fundamentos y Taller',
        subtitle: 'Precisión ±0,5 mm y estaciones móviles',
        duration: '0-4 meses',
        color: '#8B5E3C',
        icon: '🏗️',
        objectives: [
            'Dominar cortes a escuadra repetitivos',
            'Lograr precisión de ±0,5 mm en cortes',
            'Construir el ecosistema del micro-taller (banco, carro, panel)',
            'Validar el trineo a 90º (método de 5 cortes)'
        ],
        skills: ['Seguridad en sierra de banco', 'Ajuste de guías', 'Lijado progresivo 80-180', 'Encolado estructural'],
        exercises: [
            '40 cortes repetitivos por semana (medir variación)',
            'Prueba de 5 cortes hasta error cero',
            'Construcción de 2 plantillas mensuales'
        ],
        resources: [
            { title: 'Guía: Método de 5 cortes', type: 'video' },
            { title: 'Layout: Micro-taller bajo escalera', type: 'doc' }
        ]
    },
    {
        id: 2,
        title: 'Ensambles y Estructuras',
        subtitle: 'Mortaja, espiga y rigidez',
        duration: '5-10 meses',
        color: '#D4A853',
        icon: '🪵',
        objectives: [
            'Uniones en escuadra sin juego',
            'Dominio de mortaja y espiga (holgura 0,1mm)',
            'Construcción de estructuras rígidas sin herrajes visibles'
        ],
        skills: ['Mortaja con fresadora', 'Ajuste manual de espigas', 'Diseño de bastidores'],
        exercises: [
            'Ensamble de 10 marcos de prueba',
            'Prueba de carga en bancos pequeños'
        ],
        resources: []
    },
    {
        id: 3,
        title: 'Acabados y Diseño',
        subtitle: 'Poliuretano y Aceite Duro',
        duration: '11-18 meses',
        color: '#E8882A',
        icon: '✨',
        objectives: [
            'Acabados nivel espejo sin polvo',
            'Aplicación sistemática de aceite duro',
            'Primer prototipo de Mesa Japonesa (en pino)'
        ],
        skills: ['Pre-acabado por piezas', 'Control de humedad', 'Diseño de proporciones'],
        exercises: [],
        resources: []
    },
    {
        id: 4,
        title: 'Identidad y Catálogo',
        subtitle: 'Línea de productos propia',
        duration: '2-3 años',
        color: '#A67C52',
        icon: '💼',
        objectives: [
            'Crear catálogo de 3-5 productos fijos',
            'Manual de procesos estandarizado',
            'Fotografía consistente para RRSS'
        ],
        skills: ['Costeo estándar', 'Marketing para artesanos'],
        exercises: [],
        resources: []
    },
    {
        id: 5,
        title: 'Profesionalización',
        subtitle: 'Mesa Eterna y Tickets Altos',
        duration: '3-5 años',
        color: '#5D3A1A',
        icon: '🏆',
        objectives: [
            'Construcción de Mesa Eterna en madera noble',
            'Gestión de pedidos a medida rentables',
            'Checklist de calidad total'
        ],
        skills: ['Negociación premium', 'Garantía y mantenimiento'],
        exercises: [],
        resources: []
    }
]

// MESA_ETERNA_STEPS has been removed in favor of dynamic DB-driven projects.
