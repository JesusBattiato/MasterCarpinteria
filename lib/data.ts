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

export const MESA_ETERNA_STEPS = [
    {
        id: 1,
        title: 'Diseño y Planificación (Estilo Japonés)',
        icon: '📐',
        description: 'Basado en minimalismo y uniones estructurales visibles',
        details: [
            'Tablero: 1800 x 850 x 30 mm (Petiribí/Paraíso)',
            'Bastidor: ensamble a media madera y pernos ocultos',
            'Patas: 70x70 con mortaja-espiga pasante visible',
            'Corte de colisas para movimiento higroscópico'
        ],
        materials: ['Madera noble seleccionada', 'Pernos roscados ocultos', 'Z-clips'],
        tips: [
            'Diseñar para durar generaciones',
            'No usar tornillos en la tapa, usar colisas'
        ]
    },
    {
        id: 2,
        title: 'Preparación de Madera noble',
        icon: '🌳',
        description: 'Aclimatación y selección de veta',
        details: [
            'Dejar madera 1 semana en taller',
            'Selección de caras para ' + 'tablero espejo',
            'Verificar humedad 8-12%'
        ],
        materials: [],
        tips: []
    },
    {
        id: 3,
        title: 'Construcción de Bastidor',
        icon: '🔧',
        description: 'Ensambles de precisión ±0,1mm',
        details: [
            'Mortajas pasantes en patas',
            'Espigas con hombros precisos',
            'Ensambles a cuña tradicional'
        ],
        materials: ['Cola PVA D3'],
        tips: ['Ajuste de espigas a mano con formón']
    }
    // ... more steps will be added by IA as the user progresses
]
