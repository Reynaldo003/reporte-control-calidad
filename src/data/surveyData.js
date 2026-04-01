export const asesores = [
  "Valeria Zilli Durante",
  "Geovani Nava Diaz",
  "Aura Marlizeth Fernandez Lopez",
  "Bianca Isabel Chavez Alarcon",
  "Erendira Santos Coyotzi",
  "Irene Del Carmen Guiza Lopez",
  "Marcos Raul Diaz Ramos",
  "Mario Alberto Lopez Ramos",
  "Marisol Lagunes Gonzalez",
  "Nallely Hernandez Garcia",
  "Octavio Bruno Gonzalez",
  "Rogelio Vazquez Sanchez",
  "Ruben Alberto Tosquy Adriano",
  "Saja Azzam Mohammad Jamous",
  "Sandra Luz Prieto Perez",
  "Yamil Misael Rodriguez Aguilar",
];

export const motivos = [
  "El prestigio de la marca me trajo",
  "Los anuncios en redes sociales llamaron mi atención",
  "Un asesor de ventas sembró interés en mí",
  "Llegué por curiosidad a la agencia",
  "Soy fiel al concesionario y/o al grupo automotriz R&R",
];

export const opcionesCalificacion = [
  {
    value: 1,
    emoji: "😕",
    titulo: "Muy mala",
    descripcion: "No fue una buena experiencia",
  },
  {
    value: 2,
    emoji: "😐",
    titulo: "Mala",
    descripcion: "Hubo varios puntos por mejorar",
  },
  {
    value: 3,
    emoji: "🙂",
    titulo: "Regular",
    descripcion: "Aceptable, pero puede mejorar",
  },
  {
    value: 4,
    emoji: "😄",
    titulo: "Muy buena",
    descripcion: "Me sentí bien atendido",
  },
  {
    value: 5,
    emoji: "🤩",
    titulo: "Excelente",
    descripcion: "Superó mis expectativas",
  },
];

export const pasos = [
  {
    id: "nombre",
    tipo: "texto",
    etiqueta: "Nombre",
    titulo: "¿Cómo le gustaría identificarse?",
    placeholder: "Escriba su nombre",
  },
  {
    id: "asesor",
    tipo: "asesor",
    etiqueta: "Asesor",
    titulo: "¿Qué asesor le atendió?",
  },
  {
    id: "motivo",
    tipo: "motivo",
    etiqueta: "Motivo",
    titulo: "¿Qué le motivó a visitar la agencia?",
  },
  {
    id: "amabilidad",
    tipo: "calificacion",
    etiqueta: "Amabilidad",
    titulo: "¿Cómo fue la amabilidad y trato de su asesor?",
  },
  {
    id: "seguimiento",
    tipo: "calificacion",
    etiqueta: "Seguimiento",
    titulo: "¿Cómo evaluaría el seguimiento de su asesor?",
  },
  {
    id: "entrega",
    tipo: "calificacion",
    etiqueta: "Entrega",
    titulo: "¿Cómo ha sido el tiempo de entrega de su unidad?",
  },
  {
    id: "satisfaccion",
    tipo: "calificacion",
    etiqueta: "Satisfacción",
    titulo:
      "¿Qué tan satisfecho está con la experiencia de recibir su auto nuevo?",
  },
  {
    id: "comentario",
    tipo: "comentario",
    etiqueta: "Comentario",
    titulo: "Si gusta, compártanos un comentario final",
    placeholder: "Escriba aquí su comentario...",
  },
];
