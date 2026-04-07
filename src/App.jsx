import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileText,
  Paperclip,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Video,
  Wrench,
} from "lucide-react";
import fondo3 from "./assets/fondo3.jpg";
import {
  crearChecklistInicial,
  ESTADOS_REVISION,
  PRIORIDADES_REPORTE,
  DEALER,
  TIPOS_REPORTE,
} from "./data/reporteCalidadData";
import { crearReporteCalidad } from "./lib/reportesApi";

const STORAGE_KEY = "reporte-calidad-mobile-v1";

function cls(...clases) {
  return clases.filter(Boolean).join(" ");
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
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
    checklist: crearChecklistInicial(),
    adjuntos_generales: [],
    comentarios_finales: "",
  };
}

function formatearTamano(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
          "w-full rounded-2xl border bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/50",
          error
            ? "border-red-300 focus:border-red-300"
            : "border-white/10 focus:border-white/30"
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
          "w-full rounded-2xl border bg-white/10 px-4 py-3 text-white outline-none transition",
          error
            ? "border-red-300 focus:border-red-300"
            : "border-white/10 focus:border-white/30"
        )}
      >
        {opciones.map((opcion) => (
          <option key={opcion.value} value={opcion.value} className="text-slate-900">
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
          "w-full resize-none rounded-2xl border bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/50",
          error
            ? "border-red-300 focus:border-red-300"
            : "border-white/10 focus:border-white/30"
        )}
      />
      {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
    </div>
  );
}

function ListaArchivos({ archivos, onEliminar, tono = "normal" }) {
  if (!archivos.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/60">
        Sin archivos cargados.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {archivos.map((archivo, indice) => (
        <div
          key={`${archivo.name}-${indice}`}
          className={cls(
            "flex items-center justify-between gap-3 rounded-2xl border px-3 py-3",
            tono === "alerta"
              ? "border-red-300/20 bg-red-500/5"
              : "border-white/10 bg-white/5"
          )}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {archivo.name}
            </p>
            <p className="text-xs text-white/60">{formatearTamano(archivo.size)}</p>
          </div>

          <button
            type="button"
            onClick={() => onEliminar(indice)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-red-500/15"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function BotonCarga({ icono, texto, accept, capture, multiple = true, onChange }) {
  const Icono = icono;

  return (
    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
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
        "rounded-3xl border p-4",
        tono === "alerta"
          ? "border-red-300/20 bg-red-500/10"
          : "border-white/10 bg-white/5"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
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
      setFormulario({
        ...crearEstadoInicial(),
        ...datos,
        checklist: (datos.checklist || []).length
          ? datos.checklist.map((item) => ({
            ...item,
            fotos: item.fotos || [],
            videos: item.videos || [],
            archivos: item.archivos || [],
          }))
          : crearChecklistInicial(),
      });
    } catch (error) {
      console.error("No se pudo restaurar el borrador:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formulario));
  }, [formulario]);

  const resumen = useMemo(() => {
    const totalItems = formulario.checklist.length;
    const contestados = formulario.checklist.filter((item) => item.estado).length;
    const noConformes = formulario.checklist.filter((item) => item.estado === "no").length;
    const totalEvidencias = formulario.checklist.reduce(
      (acc, item) =>
        acc + item.fotos.length + item.videos.length + item.archivos.length,
      0
    ) + formulario.adjuntos_generales.length;

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
        item.id === itemId ? { ...item, ...cambios } : item
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
          [tipo]: [...item[tipo], ...archivosNuevos],
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
          [tipo]: item[tipo].filter((_, indice) => indice !== indiceArchivo),
        };
      }),
    }));
  }

  function agregarAdjuntosGenerales(archivosNuevos) {
    setFormulario((prev) => ({
      ...prev,
      adjuntos_generales: [...prev.adjuntos_generales, ...archivosNuevos],
    }));
  }

  function eliminarAdjuntoGeneral(indiceArchivo) {
    setFormulario((prev) => ({
      ...prev,
      adjuntos_generales: prev.adjuntos_generales.filter(
        (_, indice) => indice !== indiceArchivo
      ),
    }));
  }

  function limpiarFormulario() {
    const nuevoEstado = crearEstadoInicial();
    setFormulario(nuevoEstado);
    setErrores({});
    setMensaje("");
    setGuardado(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  function validarFormulario() {
    const nuevosErrores = {};

    if (!formulario.reportante.trim()) {
      nuevosErrores.reportante = "Ingresa el nombre de quien levanta el reporte.";
    }

    if (!formulario.sede.trim()) {
      nuevosErrores.agencia = "Selecciona la agencia.";
    }

    if (!formulario.nombre_cliente.trim()) {
      nuevosErrores.nombre_cliente = "Ingresa el nombre del cliente.";
    }

    if (!formulario.orden_servicio.trim()) {
      nuevosErrores.orden_servicio = "Ingresa la orden de servicio.";
    }

    if (!formulario.tecnico_reparo.trim()) {
      nuevosErrores.tecnico_reparo = "Ingresa el técnico que reparó.";
    }

    if (!formulario.valido_control_calidad.trim()) {
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

      if (item.estado === "no" && !item.observaciones.trim()) {
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
          className="overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_80px_-25px_rgba(19,30,92,0.30)]"
          style={{
            backgroundImage: `linear-gradient(rgba(10,19,55,0.40), rgba(10,19,55,0.50)), url(${fondo3})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white">
                  Control de calidad
                </span>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Levantamiento de reporte de control de calidad
                </h1>
              </div>
            </div>
            <form onSubmit={enviarReporte} className="space-y-8">
              <section className="rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <CampoTexto
                    label="Reportante"
                    requerido
                    value={formulario.reportante}
                    onChange={(valor) => actualizarCampo("reportante", valor)}
                    placeholder="Nombre completo"
                    error={errores.reportante}
                  />

                  <CampoSelect
                    label="Dealer"
                    requerido
                    value={formulario.sede}
                    onChange={(valor) => actualizarCampo("sede", valor)}
                    opciones={DEALER}
                  />
                  <CampoTexto
                    label="Fecha del reporte"
                    requerido
                    type="date"
                    value={formulario.fecha_reporte}
                    onChange={(valor) => actualizarCampo("fecha_reporte", valor)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 mt-4">
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
                  <CampoTexto
                    label="Técnico que reparó"
                    requerido
                    value={formulario.tecnico_reparo}
                    onChange={(valor) => actualizarCampo("tecnico_reparo", valor)}
                    placeholder="Nombre del técnico"
                    error={errores.tecnico_reparo}
                  />

                  <CampoTexto
                    label="Validó control de calidad"
                    requerido
                    value={formulario.valido_control_calidad}
                    onChange={(valor) =>
                      actualizarCampo("valido_control_calidad", valor)
                    }
                    placeholder="Nombre del responsable"
                    error={errores.valido_control_calidad}
                  />
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="space-y-4">
                  {formulario.checklist.map((item, indice) => {
                    const errorItem = errores.checklist?.[item.id] || "";
                    const tonoAlerta = item.estado === "no" || Boolean(errorItem);

                    return (
                      <article
                        key={item.id}
                        className={cls(
                          "rounded-[26px] border p-4 sm:p-5",
                          tonoAlerta
                            ? "border-red-300/20 bg-red-500/5"
                            : "border-white/10 bg-white/5"
                        )}
                      >
                        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                              Punto {indice + 1}
                            </div>
                            <h3 className="text-lg font-semibold text-white">
                              {item.titulo}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-white/75">
                              {item.descripcion}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {ESTADOS_REVISION.filter((estado) =>
                              estado.value === "na" ? item.permiteNoAplica : true
                            ).map((estado) => (
                              <button
                                key={estado.value}
                                type="button"
                                onClick={() =>
                                  actualizarItem(item.id, { estado: estado.value })
                                }
                                className={cls(
                                  "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                                  item.estado === estado.value
                                    ? estado.value === "no"
                                      ? "border-red-300 bg-red-500/20 text-white"
                                      : "border-white bg-white text-[#131e5c]"
                                    : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                                )}
                              >
                                {estado.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {errorItem ? (
                          <div className="mb-4 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                            {errorItem}
                          </div>
                        ) : null}

                        <div>
                          <CampoTextarea
                            label="Observaciones"
                            value={item.observaciones}
                            onChange={(valor) =>
                              actualizarItem(item.id, { observaciones: valor })
                            }
                            placeholder="Detalle del hallazgo, condición observada, acción requerida o evidencia relevante."
                            rows={5}
                          />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Adjuntos generales</h2>
                    <p className="text-sm text-white/70">
                      Evidencias que aplican al reporte completo.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <BotonCarga
                    icono={Camera}
                    texto="Foto general"
                    accept="image/*"
                    capture="environment"
                    onChange={agregarAdjuntosGenerales}
                  />
                  <BotonCarga
                    icono={Video}
                    texto="Video general"
                    accept="video/*"
                    capture="environment"
                    onChange={agregarAdjuntosGenerales}
                  />
                  <BotonCarga
                    icono={Paperclip}
                    texto="Archivo general"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.mov"
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
                    "rounded-2xl border px-4 py-3 text-sm",
                    guardado
                      ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-100"
                      : "border-red-300/20 bg-red-500/10 text-red-100"
                  )}
                >
                  {mensaje}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpiar
                  </button>

                  <button
                    type="submit"
                    disabled={enviando}
                    className={cls(
                      "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
                      enviando
                        ? "cursor-not-allowed bg-white/40 text-white"
                        : "bg-white text-[#131e5c] hover:bg-white/90"
                    )}
                  >
                    {enviando ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#131e5c]/30 border-t-[#131e5c]" />
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}