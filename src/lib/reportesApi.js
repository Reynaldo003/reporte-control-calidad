const API_BASE = (
  import.meta.env.VITE_API_URL || "https://crm.grupoautomotrizryr.com"
).replace(/\/+$/, "");

function limpiarTexto(valor) {
  return String(valor ?? "").trim();
}

function asegurarArreglo(valor) {
  return Array.isArray(valor) ? valor.filter(Boolean) : [];
}

function normalizarChecklist(checklist = []) {
  return checklist.map((item) => ({
    id: limpiarTexto(item.id),
    titulo: limpiarTexto(item.titulo),
    descripcion: limpiarTexto(item.descripcion),
    permite_no_aplica: Boolean(
      item.permiteNoAplica ?? item.permite_no_aplica ?? false,
    ),
    estado: limpiarTexto(item.estado).toLowerCase(),
    observaciones: limpiarTexto(item.observaciones),
  }));
}

function agregarAdjuntosChecklist(formData, checklist = []) {
  checklist.forEach((item) => {
    const itemId = limpiarTexto(item.id);
    if (!itemId) return;

    asegurarArreglo(item.fotos).forEach((archivo) => {
      formData.append(`item_${itemId}_fotos`, archivo);
    });

    asegurarArreglo(item.videos).forEach((archivo) => {
      formData.append(`item_${itemId}_videos`, archivo);
    });

    asegurarArreglo(item.archivos).forEach((archivo) => {
      formData.append(`item_${itemId}_archivos`, archivo);
    });
  });
}

function obtenerMensajeError(payload) {
  if (!payload) return "No fue posible guardar el reporte.";

  if (typeof payload === "string") return payload;

  if (payload.detail) return payload.detail;
  if (payload.message) return payload.message;

  if (typeof payload === "object") {
    for (const valor of Object.values(payload)) {
      if (Array.isArray(valor) && valor.length > 0) {
        return String(valor[0]);
      }

      if (typeof valor === "string" && valor.trim()) {
        return valor;
      }

      if (typeof valor === "object" && valor !== null) {
        const interno = obtenerMensajeError(valor);
        if (interno) return interno;
      }
    }
  }

  return "No fue posible guardar el reporte.";
}

export async function crearReporteCalidad(formulario) {
  const formData = new FormData();

  formData.append("fecha_reporte", formulario.fecha_reporte || "");
  formData.append("reportante", limpiarTexto(formulario.reportante));
  formData.append("agencia", limpiarTexto(formulario.sede));
  formData.append("nombre_cliente", limpiarTexto(formulario.nombre_cliente));
  formData.append("orden_servicio", limpiarTexto(formulario.orden_servicio));
  formData.append("tecnico_reparo", limpiarTexto(formulario.tecnico_reparo));
  formData.append(
    "valido_control_calidad",
    limpiarTexto(formulario.valido_control_calidad),
  );
  formData.append(
    "comentarios_finales",
    limpiarTexto(formulario.comentarios_finales),
  );

  const checklistNormalizado = normalizarChecklist(formulario.checklist || []);
  formData.append("checklist", JSON.stringify(checklistNormalizado));

  asegurarArreglo(formulario.adjuntos_generales).forEach((archivo) => {
    formData.append("adjuntos_generales", archivo);
  });

  agregarAdjuntosChecklist(formData, formulario.checklist || []);

  const response = await fetch(`${API_BASE}/api/public/safety/reportes/`, {
    method: "POST",
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  let data = {};

  try {
    data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data));
  }

  return data;
}

export async function obtenerReportesSafety() {
  const response = await fetch(`${API_BASE}/api/safety/reportes/`, {
    method: "GET",
  });

  const contentType = response.headers.get("content-type") || "";
  let data = [];

  try {
    data = contentType.includes("application/json")
      ? await response.json()
      : [];
  } catch {
    data = [];
  }

  if (!response.ok) {
    throw new Error(obtenerMensajeError(data));
  }

  return data;
}
