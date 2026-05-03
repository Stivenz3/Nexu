import type { Lesson, LessonContent, Question, Certificate } from '@/types'

export const mockLessons: Lesson[] = [
  {
    id: '1',
    number: 1,
    title: 'Higiene personal del manipulador',
    description: 'Fundamentos sobre lavado de manos, vestimenta y conducta higienica.',
    duration: 12,
    status: 'available',
  },
  {
    id: '2',
    number: 2,
    title: 'Control de temperaturas y almacenamiento',
    description: 'Aprende sobre la cadena de frio y almacenamiento seguro.',
    duration: 15,
    status: 'locked',
  },
  {
    id: '3',
    number: 3,
    title: 'Limpieza y desinfeccion de superficies',
    description: 'Protocolos de limpieza para areas de preparacion.',
    duration: 10,
    status: 'locked',
  },
  {
    id: '4',
    number: 4,
    title: 'Manejo de residuos y plagas',
    description: 'Control integrado de plagas y gestion de residuos.',
    duration: 18,
    status: 'locked',
  },
  {
    id: '5',
    number: 5,
    title: 'Evaluacion final de certificacion',
    description: 'Evaluacion comprensiva de todos los modulos.',
    duration: 20,
    status: 'locked',
  },
]

export const mockLessonContent: LessonContent = {
  id: '1',
  lessonId: '1',
  title: 'Por que importa la higiene?',
  subtitle: 'La seguridad alimentaria comienza en tus manos.',
  sections: [
    {
      id: 's1',
      type: 'text',
      title: 'Panorama en Colombia',
      content: `En Colombia, las **Enfermedades Transmitidas por Alimentos (ETA)** representan un desafio constante para la salud publica. Segun el Instituto Nacional de Salud, miles de casos son reportados anualmente, muchos de los cuales se originan por una manipulacion inadecuada en establecimientos comerciales.

Como manipulador, tus manos estan en contacto directo con materias primas, superficies y productos terminados. Un solo descuido en el protocolo de lavado puede transferir microorganismos patogenos como *Salmonella* o *E. coli* a un plato listo para el consumo.`,
    },
    {
      id: 's2',
      type: 'key-concept',
      title: 'Concepto Clave: Inocuidad',
      content: 'Es la garantia de que los alimentos no causaran dano al consumidor cuando se preparen y/o consuman de acuerdo con el uso a que se destinan. La higiene es el pilar fundamental para alcanzarla.',
    },
    {
      id: 's3',
      type: 'image',
      content: 'Lavado correcto de manos: tecnica para reducir el riesgo de contaminacion cruzada en la industria alimentaria.',
      imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80',
    },
  ],
}

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Cuanto tiempo minimo debe durar un lavado correcto de manos?',
    options: [
      { id: 'o1', text: '5 segundos' },
      { id: 'o2', text: '10 segundos' },
      { id: 'o3', text: '20 segundos' },
      { id: 'o4', text: '1 minuto' },
    ],
    correctOptionId: 'o3',
  },
  {
    id: 'q2',
    text: 'Cual es la temperatura minima de coccion para carne de res?',
    options: [
      { id: 'o1', text: '45 grados C' },
      { id: 'o2', text: '63 grados C' },
      { id: 'o3', text: '74 grados C' },
      { id: 'o4', text: '100 grados C' },
    ],
    correctOptionId: 'o3',
  },
  {
    id: 'q3',
    text: 'Cual es la zona de peligro de temperatura para los alimentos?',
    options: [
      { id: 'o1', text: '0 a 4 grados C' },
      { id: 'o2', text: '5 a 60 grados C' },
      { id: 'o3', text: '60 a 74 grados C' },
      { id: 'o4', text: '74 a 100 grados C' },
    ],
    correctOptionId: 'o2',
  },
  {
    id: 'q4',
    text: 'Con que frecuencia se deben lavar las manos durante la manipulacion de alimentos?',
    options: [
      { id: 'o1', text: 'Una vez al inicio del turno' },
      { id: 'o2', text: 'Cada hora' },
      { id: 'o3', text: 'Despues de cada actividad contaminante' },
      { id: 'o4', text: 'Solo cuando estan visiblemente sucias' },
    ],
    correctOptionId: 'o3',
  },
  {
    id: 'q5',
    text: 'Que elemento NO debe usar un manipulador de alimentos?',
    options: [
      { id: 'o1', text: 'Gorro de cocina' },
      { id: 'o2', text: 'Anillos y pulseras' },
      { id: 'o3', text: 'Delantal limpio' },
      { id: 'o4', text: 'Calzado cerrado' },
    ],
    correctOptionId: 'o2',
  },
]

export const mockCertificate: Certificate = {
  id: 'cert-001',
  code: 'AB12CD-3F5K',
  userId: 'NX-2026-8841',
  userName: 'Laura Gomez',
  userDocument: 'CC. 1.234.567.890',
  courseName: 'Buenas Practicas de Manufactura',
  courseModule: 'Higiene Personal',
  issueDate: new Date('2026-04-29'),
  expiryDate: new Date('2027-04-29'),
  score: 92,
  status: 'valid',
}
