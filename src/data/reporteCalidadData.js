//src/data/reporteCalidadData.js
export const PRIORIDADES_REPORTE = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

export const DEALER = [
  { value: "VW Cordoba", label: "VW Cordoba" },
  { value: "VW Orizaba", label: "VW Orizaba" },
  { value: "VW Tuxpan", label: "VW Tuxpan" },
  { value: "VW Tuxtepec", label: "VW Tuxtepec" },
  { value: "VW Poza Rica", label: "VW Poza Rica" },
];

export const TIPOS_REPORTE = [
  { value: "control_calidad", label: "Control de calidad" },
  { value: "seguridad", label: "Seguridad" },
  { value: "hallazgo", label: "Hallazgo" },
  { value: "observacion", label: "Observación preventiva" },
];

export const ESTADOS_REVISION = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
  { value: "na", label: "No aplica" },
];

export const ITEMS_REPORTE = [
  {
    id: "plan_asistencia_tecnica",
    titulo: "Verificar plan de asistencia técnica",
    descripcion:
      "Revisar trabajos pendientes de la visita anterior, lo realizado en esta visita y la programación del próximo servicio.",
    permiteNoAplica: false,
  },
  {
    id: "luces",
    titulo: "Verificar correcto estado y funcionamiento de luces",
    descripcion:
      "Validar faros, direccionales, reversa, freno, luces interiores y demás señales del vehículo.",
    permiteNoAplica: false,
  },
  {
    id: "limpiaparabrisas",
    titulo: "Verificar funcionamiento y estado del limpiaparabrisas",
    descripcion:
      "Comprobar condición de gomas y calidad de limpieza, además del pulverizado del lavacristales.",
    permiteNoAplica: false,
  },
  {
    id: "fluidos_bateria",
    titulo: "Verificar niveles de fluido y batería",
    descripcion:
      "Comprobar niveles de aceite, frenos, refrigerante, lavacristales y condición visible de terminales.",
    permiteNoAplica: false,
  },
  {
    id: "puertas_levantacristales",
    titulo: "Verificar puertas y levantacristales",
    descripcion:
      "Comprobar funcionamiento de vidrios y correcta lubricación de puertas.",
    permiteNoAplica: false,
  },
  {
    id: "neumaticos_frenos",
    titulo: "Verificar neumáticos y frenos",
    descripcion:
      "Validar desgaste, daños visibles y condición general de frenado.",
    permiteNoAplica: false,
  },
  {
    id: "bajos_vehiculo",
    titulo: "Verificar bajos del vehículo",
    descripcion:
      "Revisar fugas, fijaciones, tren de rodaje, protección de bajos y escape.",
    permiteNoAplica: false,
  },
  {
    id: "trabajo_realizado",
    titulo: "Verificar trabajo realizado íntegra y correctamente",
    descripcion:
      "Confirmar que la orden fue atendida correctamente y que lo realizado quedó documentado.",
    permiteNoAplica: false,
  },
  {
    id: "formato_mantenimiento",
    titulo: "Verificar formato de mantenimiento",
    descripcion:
      "Confirmar que el formato esté completo, con revisiones y firmas correspondientes.",
    permiteNoAplica: false,
  },
  {
    id: "intervalos_proximo_servicio",
    titulo: "Verificar intervalos de próximo servicio",
    descripcion:
      "Confirmar ajuste del indicador o registro del siguiente servicio.",
    permiteNoAplica: false,
  },
  {
    id: "ampliacion_orden",
    titulo: "Verificar ampliación de la orden",
    descripcion:
      "Validar que cualquier ampliación requerida esté documentada y autorizada.",
    permiteNoAplica: true,
  },
  {
    id: "recorrido_prueba",
    titulo: "Verificar recorrido de prueba documentado",
    descripcion:
      "Confirmar si se realizó recorrido o prueba funcional y quedó documentado.",
    permiteNoAplica: true,
  },
  {
    id: "limpieza_final",
    titulo: "Verificar eliminación de rastros del trabajo realizado",
    descripcion:
      "Confirmar limpieza exterior e interior del vehículo y ausencia de residuos del trabajo.",
    permiteNoAplica: false,
  },
];

export function crearChecklistInicial() {
  return ITEMS_REPORTE.map((item) => ({
    ...item,
    estado: "",
    observaciones: "",
    fotos: [],
    videos: [],
    archivos: [],
  }));
}
