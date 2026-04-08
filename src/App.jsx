import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  Paperclip,
  Send,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import fondo3 from "./assets/fondo3.jpg";
import {
  crearChecklistInicial,
  ESTADOS_REVISION,
  DEALER,
  TECNICO,
  VALIDA,
} from "./data/reporteCalidadData";
import { crearReporteCalidad } from "./lib/reportesApi";

const STORAGE_KEY = "reporte-calidad-mobile-v2";

function cls(...clases) {
  return clases.filter(Boolean).join(" ");
}

function hoy() {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function limpiarTexto(valor) {
  return String(valor ?? "").trim();
}

function asegurarArreglo(valor) {
  return Array.isArray(valor) ? valor : [];
}

function formatearTamano(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function normalizarItemChecklist(item = {}) {
  return {
    id: limpiarTexto(item.id),
    titulo: limpiarTexto(item.titulo),
    descripcion: limpiarTexto(item.descripcion),
    permiteNoAplica: Boolean(
      item.permiteNoAplica ?? item.permite_no_aplica ?? false,
    ),
    estado: limpiarTexto(item.estado).toLowerCase(),
    observaciones: limpiarTexto(item.observaciones),
    fotos: asegurarArreglo(item.fotos),
    videos: asegurarArreglo(item.videos),
    archivos: asegurarArreglo(item.archivos),
  };
}

function crearEstadoInicial() {
  return {
    reportante: "",
    sede: DEALER[0]?.value || "",
    fecha_reporte: hoy(),
    nombre_cliente: "",
    orden_servicio: "",
    tecnico_reparo: "",
    valido_control_calidad: "",
    checklist: crearChecklistInicial().map(normalizarItemChecklist),
    adjuntos_generales: [],
    comentarios_finales: "",
  };
}

function serializarBorrador(formulario) {
  return {
    reportante: formulario.reportante || "",
    sede: formulario.sede || "",
    fecha_reporte: formulario.fecha_reporte || hoy(),
    nombre_cliente: formulario.nombre_cliente || "",
    orden_servicio: formulario.orden_servicio || "",
    tecnico_reparo: formulario.tecnico_reparo || "",
    valido_control_calidad: formulario.valido_control_calidad || "",
    comentarios_finales: formulario.comentarios_finales || "",
    checklist: asegurarArreglo(formulario.checklist).map((item) => ({
      id: limpiarTexto(item.id),
      titulo: limpiarTexto(item.titulo),
      descripcion: limpiarTexto(item.descripcion),
      permiteNoAplica: Boolean(
        item.permiteNoAplica ?? item.permite_no_aplica ?? false,
      ),
      estado: limpiarTexto(item.estado).toLowerCase(),
      observaciones: limpiarTexto(item.observaciones),
    })),
  };
}

function hidratarBorrador(data = {}) {
  const base = crearEstadoInicial();

  return {
    ...base,
    ...data,
    checklist: asegurarArreglo(data.checklist).length
      ? data.checklist.map(normalizarItemChecklist)
      : base.checklist,
    adjuntos_generales: [],
  };
}

function unirArchivosSinDuplicar(actuales = [], nuevos = []) {
  const mapa = new Map();

  [...asegurarArreglo(actuales), ...asegurarArreglo(nuevos)].forEach((archivo) => {
    if (!(archivo instanceof File)) return;

    const llave = `${archivo.name}-${archivo.size}-${archivo.lastModified}`;
    if (!mapa.has(llave)) {
      mapa.set(llave, archivo);
    }
  });

  return Array.from(mapa.values());
}

function totalEvidenciasDeItem(item) {
  return (
    asegurarArreglo(item.fotos).length +
    asegurarArreglo(item.videos).length +
    asegurarArreglo(item.archivos).length
  );
}

function EtiquetaCampo({ children, requerido = false }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-white">
      {children}
      {requerido ? <span className="ml-1 text-red-300">*</span> : null}
    </label>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  requerido = false,
  error = "",
  type = "text",
}) {
  return (
    <div>
      <EtiquetaCampo requerido={requerido}>{label}</EtiquetaCampo>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cls(
          "w-full rounded-lg border bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/50",
          error
            ? "border-red-300 focus:border-red-300"
            : "border-white/10 focus:border-white/30",
        )}
      />
      {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
    </div>
  );
}

function CampoSelect({
  label,
  value,
  onChange,
  opciones,
  requerido = false,
  error = "",
}) {
  return (
    <div>
      <EtiquetaCampo requerido={requerido}>{label}</EtiquetaCampo>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cls(
          "w-full rounded-lg border bg-white/10 px-4 py-3 text-white outline-none transition",
          error
            ? "border-red-300 focus:border-red-300"
            : "border-white/10 focus:border-white/30",
        )}
      >
        {opciones.map((opcion) => (
          <option
            key={opcion.value}
            value={opcion.value}
            className="text-slate-900"
          >
            {opcion.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
    </div>
  );
}

function CampoTextarea({
  label,
  value,
  onChange,
  placeholder,
  requerido = false,
  error = "",
  rows = 4,
}) {
  return (
    <div>
      <EtiquetaCampo requerido={requerido}>{label}</EtiquetaCampo>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cls(
          "w-full resize-none rounded-lg border bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/50",
          error
            ? "border-red-300 focus:border-red-300"
            : "border-white/10 focus:border-white/30",
        )}
      />
      {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
    </div>
  );
}

function ListaArchivos({ archivos, onEliminar, tono = "normal" }) {
  if (!archivos.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 px-4 py-3 text-sm text-white/60">
        Sin archivos cargados.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {archivos.map((archivo, indice) => (
        <div
          key={`${archivo.name}-${archivo.size}-${archivo.lastModified}-${indice}`}
          className={cls(
            "flex items-center justify-between gap-3 rounded-lg border px-3 py-3",
            tono === "alerta"
              ? "border-red-300/20 bg-red-500/5"
              : "border-white/10 bg-white/5",
          )}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {archivo.name}
            </p>
            <p className="text-xs text-white/60">
              {formatearTamano(archivo.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onEliminar(indice)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-red-500/15"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function GrupoArchivos({ titulo, archivos, onEliminar, tono = "normal" }) {
  if (!archivos.length) return null;

  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/70">
        {titulo} ({archivos.length})
      </div>
      <ListaArchivos archivos={archivos} onEliminar={onEliminar} tono={tono} />
    </div>
  );
}

function BotonCarga({
  icono,
  texto,
  accept,
  capture,
  multiple = true,
  onChange,
}) {
  const Icono = icono;

  return (
    <label className="inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.99]">
      <Icono className="h-4 w-4" />
      {texto}
      <input
        type="file"
        accept={accept}
        capture={capture}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const archivos = Array.from(e.target.files || []);
          if (archivos.length) onChange(archivos);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function TarjetaResumen({ icono, titulo, valor, tono = "normal" }) {
  const Icono = icono;

  return (
    <div
      className={cls(
        "rounded-lg border p-4",
        tono === "alerta"
          ? "border-red-300/20 bg-red-500/10"
          : "border-white/10 bg-white/5",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-white">
          <Icono className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-white/70">{titulo}</p>
          <p className="text-xl font-bold text-white">{valor}</p>
        </div>
      </div>
    </div>
  );
}

function ChipConteo({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
      {label}: {value}
    </div>
  );
}

export default function ReporteCalidadApp() {
  const [formulario, setFormulario] = useState(crearEstadoInicial);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const guardadoLocal = localStorage.getItem(STORAGE_KEY);
    if (!guardadoLocal) return;

    try {
      const datos = JSON.parse(guardadoLocal);
      setFormulario(hidratarBorrador(datos));
    } catch (error) {
      console.error("No se pudo restaurar el borrador:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(serializarBorrador(formulario)),
    );
  }, [formulario]);

  const resumen = useMemo(() => {
    const totalItems = formulario.checklist.length;
    const contestados = formulario.checklist.filter((item) => item.estado).length;
    const noConformes = formulario.checklist.filter(
      (item) => item.estado === "no",
    ).length;

    const totalEvidenciasPuntos = formulario.checklist.reduce(
      (acc, item) => acc + totalEvidenciasDeItem(item),
      0,
    );

    const totalEvidencias =
      totalEvidenciasPuntos + asegurarArreglo(formulario.adjuntos_generales).length;

    return {
      totalItems,
      contestados,
      pendientes: totalItems - contestados,
      noConformes,
      totalEvidencias,
    };
  }, [formulario]);

  function actualizarCampo(campo, valor) {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function actualizarItem(itemId, cambios) {
    setFormulario((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, ...cambios } : item,
      ),
    }));
  }

  function agregarArchivosAItem(itemId, tipo, archivosNuevos) {
    setFormulario((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) => {
        if (item.id !== itemId) return item;

        return {
          ...item,
          [tipo]: unirArchivosSinDuplicar(item[tipo], archivosNuevos),
        };
      }),
    }));
  }

  function eliminarArchivoDeItem(itemId, tipo, indiceArchivo) {
    setFormulario((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) => {
        if (item.id !== itemId) return item;

        return {
          ...item,
          [tipo]: asegurarArreglo(item[tipo]).filter(
            (_, indice) => indice !== indiceArchivo,
          ),
        };
      }),
    }));
  }

  function agregarAdjuntosGenerales(archivosNuevos) {
    setFormulario((prev) => ({
      ...prev,
      adjuntos_generales: unirArchivosSinDuplicar(
        prev.adjuntos_generales,
        archivosNuevos,
      ),
    }));
  }

  function eliminarAdjuntoGeneral(indiceArchivo) {
    setFormulario((prev) => ({
      ...prev,
      adjuntos_generales: asegurarArreglo(prev.adjuntos_generales).filter(
        (_, indice) => indice !== indiceArchivo,
      ),
    }));
  }

  function limpiarFormulario() {
    setFormulario(crearEstadoInicial());
    setErrores({});
    setMensaje("");
    setGuardado(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  function validarFormulario() {
    const nuevosErrores = {};

    if (!limpiarTexto(formulario.reportante)) {
      nuevosErrores.reportante = "Ingresa el nombre de quien levanta el reporte.";
    }

    if (!limpiarTexto(formulario.sede)) {
      nuevosErrores.agencia = "Selecciona la agencia.";
    }

    if (!limpiarTexto(formulario.fecha_reporte)) {
      nuevosErrores.fecha_reporte = "Selecciona la fecha del reporte.";
    }

    if (!limpiarTexto(formulario.nombre_cliente)) {
      nuevosErrores.nombre_cliente = "Ingresa el nombre del cliente.";
    }

    if (!limpiarTexto(formulario.orden_servicio)) {
      nuevosErrores.orden_servicio = "Ingresa la orden de servicio.";
    }

    if (!limpiarTexto(formulario.tecnico_reparo)) {
      nuevosErrores.tecnico_reparo = "Ingresa el técnico que reparó.";
    }

    if (!limpiarTexto(formulario.valido_control_calidad)) {
      nuevosErrores.valido_control_calidad =
        "Ingresa quién validó el control de calidad.";
    }

    const erroresChecklist = {};

    formulario.checklist.forEach((item) => {
      if (!item.estado) {
        erroresChecklist[item.id] = "Selecciona un estado para este punto.";
        return;
      }

      if (item.estado === "na" && !item.permiteNoAplica) {
        erroresChecklist[item.id] = "Este punto no permite No aplica.";
        return;
      }

      if (item.estado === "no" && !limpiarTexto(item.observaciones)) {
        erroresChecklist[item.id] =
          "Cuando el resultado es No debes escribir observaciones.";
      }
    });

    if (Object.keys(erroresChecklist).length > 0) {
      nuevosErrores.checklist = erroresChecklist;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function enviarReporte(e) {
    e.preventDefault();

    setMensaje("");
    setGuardado(false);

    if (!validarFormulario()) {
      setMensaje("Revisa los campos marcados antes de guardar.");
      return;
    }

    try {
      setEnviando(true);
      await crearReporteCalidad(formulario);

      setGuardado(true);
      setMensaje("Reporte guardado correctamente.");

      localStorage.removeItem(STORAGE_KEY);
      setErrores({});
      setFormulario(crearEstadoInicial());
    } catch (error) {
      console.error(error);
      setMensaje(error.message || "No fue posible guardar el reporte.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#131e5c]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(44,91,187,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.10),_transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(6,16,45,0.96),rgba(11,31,94,0.92),rgba(7,16,38,0.98))]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div
          className="overflow-hidden rounded-4xl border border-white/10 shadow-[0_30px_80px_-25px_rgba(19,30,92,0.30)]"
          style={{
            backgroundImage: `linear-gradient(rgba(10,19,55,0.40), rgba(10,19,55,0.50)), url(${fondo3})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4">
              <div>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Reporte de control de calidad
                </h1>
              </div>
            </div>
            <form onSubmit={enviarReporte} className="space-y-8">
              <section className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <CampoTexto
                    label="Reportante"
                    requerido
                    value={formulario.reportante}
                    onChange={(valor) => actualizarCampo("reportante", valor)}
                    placeholder="Nombre de quien reporta"
                    error={errores.reportante}
                  />

                  <CampoSelect
                    label="Dealer"
                    requerido
                    value={formulario.sede}
                    onChange={(valor) => actualizarCampo("sede", valor)}
                    opciones={DEALER}
                    error={errores.agencia}
                  />

                  <CampoTexto
                    label="Fecha del reporte"
                    requerido
                    type="date"
                    value={formulario.fecha_reporte}
                    onChange={(valor) => actualizarCampo("fecha_reporte", valor)}
                    error={errores.fecha_reporte}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <CampoTexto
                    label="Nombre del cliente"
                    requerido
                    value={formulario.nombre_cliente}
                    onChange={(valor) => actualizarCampo("nombre_cliente", valor)}
                    placeholder="Nombre del cliente"
                    error={errores.nombre_cliente}
                  />

                  <CampoTexto
                    label="Orden de servicio"
                    requerido
                    value={formulario.orden_servicio}
                    onChange={(valor) => actualizarCampo("orden_servicio", valor)}
                    placeholder="OS-000123"
                    error={errores.orden_servicio}
                  />

                  <CampoSelect
                    label="Técnico que reparó"
                    requerido
                    value={formulario.tecnico_reparo}
                    onChange={(valor) => actualizarCampo("tecnico_reparo", valor)}
                    opciones={TECNICO}
                    error={errores.tecnico_reparo}
                  />

                  <CampoSelect
                    label="Validó control de calidad"
                    requerido
                    value={formulario.valido_control_calidad}
                    onChange={(valor) =>
                      actualizarCampo("valido_control_calidad", valor)
                    }
                    opciones={VALIDA}
                    error={errores.valido_control_calidad}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    Checklist y evidencias por punto
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    Cada punto puede llevar sus propias fotos, videos o archivos.
                  </p>
                </div>

                <div className="space-y-4">
                  {formulario.checklist.map((item, indice) => {
                    const errorItem = errores.checklist?.[item.id] || "";
                    const tonoAlerta = item.estado === "no" || Boolean(errorItem);
                    const totalItem = totalEvidenciasDeItem(item);

                    return (
                      <article
                        key={item.id}
                        className={cls(
                          "rounded-lg border p-4 sm:p-5",
                          tonoAlerta
                            ? "border-red-300/20 bg-red-500/5"
                            : "border-white/10 bg-white/5",
                        )}
                      >
                        <div className="mb-4 flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                              Punto {indice + 1}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {item.titulo}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-white/75">
                              {item.descripcion}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {ESTADOS_REVISION.filter((estado) =>
                              estado.value === "na" ? item.permiteNoAplica : true,
                            ).map((estado) => (
                              <button
                                key={estado.value}
                                type="button"
                                onClick={() =>
                                  actualizarItem(item.id, { estado: estado.value })
                                }
                                className={cls(
                                  "rounded-lg border px-4 py-2 text-sm font-semibold transition",
                                  item.estado === estado.value
                                    ? estado.value === "no"
                                      ? "border-red-300 bg-red-500/20 text-white"
                                      : "border-white bg-white text-[#131e5c]"
                                    : "border-white/10 bg-white/5 text-white hover:bg-white/10",
                                )}
                              >
                                {estado.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {errorItem ? (
                          <div className="mb-4 rounded-lg border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {errorItem}
                          </div>
                        ) : null}

                        <CampoTextarea
                          label="Observaciones"
                          value={item.observaciones}
                          onChange={(valor) =>
                            actualizarItem(item.id, { observaciones: valor })
                          }
                          placeholder="Detalle del hallazgo, condición observada, acción requerida o evidencia relevante."
                          rows={5}
                        />

                        <div className="mt-5 rounded-lg border border-white/10 bg-[#0e173f]/40 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-white">
                                Evidencias del punto
                              </h4>
                            </div>

                            {item.estado === "no" ? (
                              <div className="text-xs font-semibold text-red-200">
                                Recomendado adjuntar evidencia del hallazgo
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <BotonCarga
                              icono={Camera}
                              texto="Tomar foto"
                              accept="image/*"
                              capture="environment"
                              multiple={false}
                              onChange={(archivos) =>
                                agregarArchivosAItem(item.id, "fotos", archivos)
                              }
                            />

                            <BotonCarga
                              icono={Camera}
                              texto="Subir foto"
                              accept="image/*"
                              onChange={(archivos) =>
                                agregarArchivosAItem(item.id, "fotos", archivos)
                              }
                            />

                            <BotonCarga
                              icono={Video}
                              texto="Tomar video"
                              accept="video/*"
                              capture="environment"
                              multiple={false}
                              onChange={(archivos) =>
                                agregarArchivosAItem(item.id, "videos", archivos)
                              }
                            />

                            <BotonCarga
                              icono={Paperclip}
                              texto="Subir archivo"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mov,.webm"
                              onChange={(archivos) =>
                                agregarArchivosAItem(item.id, "archivos", archivos)
                              }
                            />
                          </div>

                          <div className="mt-4 space-y-3">
                            {totalItem === 0 ? (
                              <div className="rounded-lg border border-dashed border-white/10 px-4 py-3 text-sm text-white/60">
                                Aún no hay evidencias en este punto.
                              </div>
                            ) : (
                              <>
                                <GrupoArchivos
                                  titulo="Fotos"
                                  archivos={item.fotos}
                                  tono={tonoAlerta ? "alerta" : "normal"}
                                  onEliminar={(indice) =>
                                    eliminarArchivoDeItem(item.id, "fotos", indice)
                                  }
                                />

                                <GrupoArchivos
                                  titulo="Videos"
                                  archivos={item.videos}
                                  tono={tonoAlerta ? "alerta" : "normal"}
                                  onEliminar={(indice) =>
                                    eliminarArchivoDeItem(item.id, "videos", indice)
                                  }
                                />

                                <GrupoArchivos
                                  titulo="Archivos"
                                  archivos={item.archivos}
                                  tono={tonoAlerta ? "alerta" : "normal"}
                                  onEliminar={(indice) =>
                                    eliminarArchivoDeItem(item.id, "archivos", indice)
                                  }
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-white">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Adjuntos generales
                    </h2>
                    <p className="text-sm text-white/70">
                      Evidencias que aplican al reporte completo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <BotonCarga
                    icono={Camera}
                    texto="Foto general"
                    accept="image/*"
                    capture="environment"
                    multiple={false}
                    onChange={agregarAdjuntosGenerales}
                  />

                  <BotonCarga
                    icono={Camera}
                    texto="Subir foto"
                    accept="image/*"
                    onChange={agregarAdjuntosGenerales}
                  />

                  <BotonCarga
                    icono={Video}
                    texto="Video general"
                    accept="video/*"
                    capture="environment"
                    multiple={false}
                    onChange={agregarAdjuntosGenerales}
                  />

                  <BotonCarga
                    icono={Paperclip}
                    texto="Archivo general"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mov,.webm"
                    onChange={agregarAdjuntosGenerales}
                  />
                </div>

                <div className="mt-4">
                  <ListaArchivos
                    archivos={formulario.adjuntos_generales}
                    onEliminar={eliminarAdjuntoGeneral}
                  />
                </div>
                <div className="mt-4">
                  <CampoTextarea
                    label="Comentarios finales"
                    value={formulario.comentarios_finales}
                    onChange={(valor) =>
                      actualizarCampo("comentarios_finales", valor)
                    }
                    placeholder="Cierre del reporte, acción recomendada o comentarios finales."
                    rows={4}
                  />
                </div>
              </section>

              {mensaje ? (
                <div
                  className={cls(
                    "rounded-lg border px-4 py-3 text-sm",
                    guardado
                      ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-100"
                      : "border-red-300/20 bg-red-500/10 text-red-100",
                  )}
                >
                  {mensaje}
                </div>
              ) : null}

              <div className="sticky bottom-3 z-20">
                <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0b1438]/90 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-white/75">
                    Pendientes:{" "}
                    <span className="font-semibold text-white">
                      {resumen.pendientes}
                    </span>{" "}
                    · Evidencias:{" "}
                    <span className="font-semibold text-white">
                      {resumen.totalEvidencias}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={limpiarFormulario}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Limpiar
                    </button>

                    <button
                      type="submit"
                      disabled={enviando}
                      className={cls(
                        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition",
                        enviando
                          ? "cursor-not-allowed bg-white/40 text-white"
                          : "bg-white text-[#131e5c] hover:bg-white/90",
                      )}
                    >
                      {enviando ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-lg border-2 border-[#131e5c]/30 border-t-[#131e5c]" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Enviar reporte
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}