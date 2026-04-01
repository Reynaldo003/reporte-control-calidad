const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function requestMultipart(path, formData) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const texto = await response.text();
    data = texto ? { detail: texto } : null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        "Ocurrió un error al guardar el reporte.",
    );
  }

  return data;
}

export async function crearReporteCalidad(reporte) {
  const formData = new FormData();

  const checklistLimpio = reporte.checklist.map(
    ({ fotos, videos, archivos, ...item }) => item,
  );

  const payload = {
    ...reporte,
    checklist: checklistLimpio,
    adjuntos_generales: undefined,
  };

  formData.append("payload", JSON.stringify(payload));

  const evidencias = [];

  reporte.checklist.forEach((item) => {
    item.fotos.forEach((archivo) => {
      evidencias.push({
        item_id: item.id,
        tipo: "foto",
        nombre_original: archivo.name,
      });
      formData.append("evidencias_archivos", archivo);
    });

    item.videos.forEach((archivo) => {
      evidencias.push({
        item_id: item.id,
        tipo: "video",
        nombre_original: archivo.name,
      });
      formData.append("evidencias_archivos", archivo);
    });

    item.archivos.forEach((archivo) => {
      evidencias.push({
        item_id: item.id,
        tipo: "archivo",
        nombre_original: archivo.name,
      });
      formData.append("evidencias_archivos", archivo);
    });
  });

  formData.append("evidencias", JSON.stringify(evidencias));

  (reporte.adjuntos_generales || []).forEach((archivo) => {
    formData.append("adjuntos_generales", archivo);
  });

  return requestMultipart("/api/reportes-calidad/", formData);
}
