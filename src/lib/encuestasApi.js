//src/lib/encuestasApi.js
const API_URL =
  import.meta.env.VITE_API_URL || "https://crm.grupoautomotrizryr.com";
// import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";

export async function crearEncuestaSatisfaccion(respuestas) {
  const payload = {
    agencia: "VW Cordoba",
    nombre_cliente: respuestas.nombre.trim(),
    asesor_atendio: respuestas.asesor,
    motivo_visita: respuestas.motivo,
    atencion_asesor: Number(respuestas.amabilidad),
    seguimiento_asesor: Number(respuestas.seguimiento),
    tiempo_entrega_unidad: Number(respuestas.entrega),
    experiencia_recepcion: Number(respuestas.satisfaccion),
    comentario: respuestas.comentario.trim(),
  };

  const respuesta = await fetch(
    API_URL + "/api/public/encuestas/satisfaccion/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  let data = null;

  try {
    data = await respuesta.json();
  } catch (error) {
    data = null;
  }

  if (!respuesta.ok) {
    const mensaje =
      data?.detail ||
      data?.message ||
      "No se pudo guardar la encuesta en el servidor.";
    throw new Error(mensaje);
  }

  return data;
}
