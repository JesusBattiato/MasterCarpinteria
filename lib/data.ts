export const LEARNING_PHASES = [
    {
        id: 1,
        title: 'Geometría y Afilado',
        subtitle: 'Precisión ±0,5 mm y bases del oficio',
        duration: '0-4 meses',
        color: '#8B5E3C',
        icon: '🏗️',
        objectives: [
            'Dominar cortes a escuadra repetitivos (Trineo a 90º)',
            'Afilado manual de formones y cepillos a espejo',
            'Entender el movimiento higroscópico de la madera',
            'Construir el ecosistema del micro-taller funcional'
        ],
        skills: ['Seguridad en máquinas', 'Técnicas de afilado', 'Metrología básica', 'Identificación de especies'],
        exercises: [
            'Prueba de 5 cortes hasta error cero',
            'Afilado de formón hasta afeitar vello',
            'Cálculo de expansión estacional en una tabla de 30cm'
        ],
        resources: [
            { title: 'Guía: Método de 5 cortes', type: 'video' },
            { title: 'Afilado: Piedras vs Diamante', type: 'video' }
        ]
    },
    {
        id: 2,
        title: 'Ingeniería de Uniones',
        subtitle: 'Mortaja, espiga y rigidez estructural',
        duration: '5-10 meses',
        color: '#D4A853',
        icon: '🪵',
        objectives: [
            'Uniones de caja y espiga con ajuste por fricción (0,1mm)',
            'Diseño de estructuras que "respiran" con el clima',
            'Dominio de la fresadora para ensambles ciegos',
            'Primera silla de prueba (mecánica de fuerzas)'
        ],
        skills: ['Mortajado de precisión', 'Ajuste manual de espigas', 'Diseño de bastidores rígidos'],
        exercises: [
            'Ensamble de 10 marcos de prueba (sin cola)',
            'Construcción de un taburete tradicional'
        ],
        resources: [
            { title: 'Anatomía de la unión Mortaja-Espiga', type: 'doc' }
        ]
    },
    {
        id: 3,
        title: 'Lenguajes de Diseño y CAD',
        subtitle: 'Modelado 3D y Estética Propia',
        duration: '11-18 meses',
        color: '#E8882A',
        icon: '✨',
        objectives: [
            'Modelado básico en Fusion 360 o SketchUp',
            'Elección de un lenguaje visual (Japonés, Shaker, Danés)',
            'Acabados químicos (Poliuretano) vs Orgánicos (Aceites)',
            'Prototipado rápido en escala 1:5'
        ],
        skills: ['Dibujo técnico digital', 'Pre-acabado por piezas', 'Teoría de Proporciones'],
        exercises: [
            'Diseño completo de un mueble en CAD',
            'Pruebas de acabado en 5 maderas distintas'
        ],
        resources: [
            { title: 'Curso de Fusion 360 para Carpinteros', type: 'video' }
        ]
    },
    {
        id: 4,
        title: 'Sistematización y Marca',
        subtitle: 'La eficiencia del artesano moderno',
        duration: '2-3 años',
        color: '#A67C52',
        icon: '💼',
        objectives: [
            'Creación de Jigs (plantillas) maestros para el catálogo',
            'Costo real: Materiales + Horas + Amortización',
            'Fotografía de producto y narrativa de marca',
            'Lanzamiento de 3 piezas estandarizadas'
        ],
        skills: ['Costeo industrial', 'Marketing de autor', 'Fotografía con celular'],
        exercises: [
            'Manual de procesos para tu pieza estrella',
            'Sesión de fotos de producto profesional'
        ],
        resources: []
    },
    {
        id: 5,
        title: 'Maestría y Mesa Eterna',
        subtitle: 'Piezas de colección y alto valor',
        duration: '3-5 años',
        color: '#5D3A1A',
        icon: '🏆',
        objectives: [
            'Construcción de la Mesa Eterna (madera noble + técnicas mixtas)',
            'Negociación de pedidos "bespoke" de alto ticket',
            'Control de calidad total y packaging de lujo',
            'Garantía de por vida y documentación de obra'
        ],
        skills: ['Venta consultiva', 'Gestión de maderas exóticas', 'Estrategia de lujo'],
        exercises: [
            'Entrega de una obra de más de $2000 USD',
            'Creación de un certificado de autenticidad'
        ],
        resources: []
    }
]

// MESA_ETERNA_STEPS has been removed in favor of dynamic DB-driven projects.
