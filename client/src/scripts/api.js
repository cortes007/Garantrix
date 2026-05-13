// scripts/api.js — Helper de fetch y utilidades globales

export const API = "http://localhost:3001";

/**
 * Wrapper de fetch con credentials y manejo de errores centralizado.
 * Lanza un Error si la respuesta no es ok.
 */
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error del servidor");
  return data;
}

/**
 * Formatea una fecha ISO a formato legible en español colombiano.
 * Ej: "2026-03-10T..." → "10/mar/2026"
 */
export function fmt(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

/**
 * Calcula startDate y endDate a partir de los campos del formulario
 * de nueva garantía.
 */
export function calcWarrantyDates(durationFrom, purchaseDate, duration) {
  const base =
    durationFrom === "today"
      ? new Date()
      : purchaseDate
      ? new Date(purchaseDate)
      : new Date();
  const start = new Date(base);
  const end   = new Date(base);
  end.setMonth(end.getMonth() + parseInt(duration));
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}
