// pages/GarantiaPublica.jsx
// Página pública de detalle de garantía — accesible vía QR o link directo
// Ruta sugerida: /garantia/:warrantyCode

import { useState, useEffect } from "react";
import { API } from "../scripts/api.js";

/* ── Paleta propia de esta página (no depende de tokens del dashboard) ── */
const P = {
  navy:    "#0B1628",
  navy2:   "#0F1E38",
  green:   "#00D68F",
  greenDim:"#00b87a",
  text:    "#E8EDF5",
  muted:   "#7A8FA8",
  border:  "rgba(255,255,255,0.08)",
  card:    "rgba(255,255,255,0.03)",
  red:     "#FF6B6B",
  yellow:  "#FFC947",
  blue:    "#5BAEFF",
};

const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${P.navy};
    color: ${P.text};
    min-height: 100vh;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .gp-fade-1 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both; }
  .gp-fade-2 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
  .gp-fade-3 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
  .gp-fade-4 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
  .gp-fade-5 { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.45s both; }

  .gp-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 6px;
  }

  .gp-spin { animation: spin 0.9s linear infinite; }
`;

/* ── Helpers ───────────────────────────────── */
function fmt(dateStr, opts = {}) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric", ...opts,
  });
}

function fmtTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("es-CO", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function daysLeft(endDate) {
  if (!endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

/* ── Logo SVG ──────────────────────────────── */
function GarantixLogo({ size = 36 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: size, height: size,
        background: "rgba(0,214,143,0.12)",
        border: "1.5px solid rgba(0,214,143,0.35)",
        borderRadius: size * 0.28,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
            stroke={P.green} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 12L11 14L15 10" stroke={P.green} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontFamily: "Syne", fontSize: size * 0.5, fontWeight: 700, letterSpacing: "0.01em" }}>
        Garan<span style={{ color: P.green }}>tix</span>
      </span>
    </div>
  );
}

/* ── Badge de estado ────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    ACTIVA:      { color: P.green,  bg: "rgba(0,214,143,0.1)",  border: "rgba(0,214,143,0.25)",  icon: "✓", label: "Garantía Activa" },
    VENCIDA:     { color: P.red,    bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.25)", icon: "✕", label: "Garantía Vencida" },
    RECLAMACIÓN: { color: P.yellow, bg: "rgba(255,201,71,0.1)",  border: "rgba(255,201,71,0.25)",  icon: "!", label: "En Reclamación" },
    RESUELTA:    { color: P.blue,   bg: "rgba(91,174,255,0.1)",  border: "rgba(91,174,255,0.25)",  icon: "✓", label: "Resuelta" },
  };
  const s = cfg[status] || cfg.ACTIVA;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "10px 20px", borderRadius: 40,
      background: s.bg, border: `1px solid ${s.border}`,
    }}>
      <span style={{
        width: 28, height: 28, borderRadius: "50%",
        background: s.color, color: P.navy,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 800,
      }}>{s.icon}</span>
      <span style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 700, color: s.color, letterSpacing: "0.03em" }}>
        {s.label}
      </span>
    </div>
  );
}

/* ── Fila de detalle ────────────────────────── */
function DetailRow({ label, value, mono = false, highlight = false }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start",
      justifyContent: "space-between", gap: 16,
      padding: "13px 0",
      borderBottom: `1px solid ${P.border}`,
    }}>
      <span style={{ fontSize: 12, color: P.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, paddingTop: 2 }}>
        {label}
      </span>
      <span style={{
        fontSize: mono ? 13 : 14, fontWeight: highlight ? 600 : 400,
        color: highlight ? P.text : P.text,
        fontFamily: mono ? "DM Mono" : "DM Sans",
        textAlign: "right", lineHeight: 1.4,
      }}>
        {value || "—"}
      </span>
    </div>
  );
}

/* ── Skeleton loader ────────────────────────── */
function Skeleton() {
  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
      {[180, 120, 280, 200, 240].map((w, i) => (
        <div key={i} className="gp-skeleton" style={{ height: 18, width: `${w}px`, maxWidth: "100%" }} />
      ))}
    </div>
  );
}

/* ── Barra de vigencia ──────────────────────── */
function VigenciaBar({ startDate, endDate }) {
  if (!startDate || !endDate) return null;
  const start   = new Date(startDate).getTime();
  const end     = new Date(endDate).getTime();
  const now     = Date.now();
  const total   = end - start;
  const elapsed = Math.min(Math.max(now - start, 0), total);
  const pct     = Math.round((elapsed / total) * 100);
  const days    = daysLeft(endDate);
  const expired = days !== null && days < 0;

  const barColor = expired ? P.red : pct > 75 ? P.yellow : P.green;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: P.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
          Vigencia consumida
        </span>
        <span style={{ fontSize: 12, color: barColor, fontWeight: 600, fontFamily: "DM Mono" }}>
          {expired ? "Expirada" : `${days} días restantes`}
        </span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: barColor,
          borderRadius: 3,
          transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: P.muted }}>{fmt(startDate)}</span>
        <span style={{ fontSize: 11, color: P.muted }}>{fmt(endDate)}</span>
      </div>
    </div>
  );
}

/* ── COMPONENTE PRINCIPAL ───────────────────── */
export default function GarantiaPublica({ warrantyCode: codeProp }) {
  // warrantyCode puede venir por prop o desde la URL
  const code = codeProp || new URLSearchParams(window.location.search).get("code") || window.location.pathname.split("/").pop();

  const [warranty, setWarranty] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!code) { setError("Código de garantía no especificado."); setLoading(false); return; }
    fetch(`${API}/api/warranties/public/${encodeURIComponent(code)}`, { credentials: "include" })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Garantía no encontrada");
        setWarranty(data.warranty);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [code]);

  const generatedAt = warranty?.createdAt;

  return (
    <>
      <style>{PAGE_CSS}</style>

      {/* FONDO DECORATIVO */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,214,143,0.05) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,127,221,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`, backgroundSize: "56px 56px" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", padding: "32px 20px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* HEADER */}
        <div className="gp-fade-1" style={{ width: "100%", maxWidth: 680, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <GarantixLogo size={38} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: P.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Certificado digital</div>
            {warranty && (
              <div style={{ fontFamily: "DM Mono", fontSize: 13, color: P.green, fontWeight: 500 }}>
                {warranty.warrantyCode}
              </div>
            )}
          </div>
        </div>

        {/* CONTENIDO */}
        {loading && (
          <div style={{ width: "100%", maxWidth: 680, background: P.card, border: `1px solid ${P.border}`, borderRadius: 20 }}>
            <Skeleton />
          </div>
        )}

        {error && (
          <div className="gp-fade-1" style={{ width: "100%", maxWidth: 680, textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
            <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, marginBottom: 8, color: P.red }}>Garantía no encontrada</div>
            <div style={{ fontSize: 14, color: P.muted, lineHeight: 1.6 }}>{error}</div>
          </div>
        )}

        {warranty && !loading && (<>

          {/* TARJETA PRINCIPAL */}
          <div className="gp-fade-2" style={{
            width: "100%", maxWidth: 550,
            background: "linear-gradient(135deg, rgba(15,30,56,0.9) 0%, rgba(11,22,40,0.95) 100%)",
            border: `1px solid ${P.border}`,
            borderRadius: 20, overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            marginBottom: 20,
          }}>
            {/* FRANJA SUPERIOR DE COLOR */}
            <div style={{
              height: 4,
              background: warranty.status === "ACTIVA"
                ? `linear-gradient(90deg, ${P.green}, ${P.greenDim})`
                : warranty.status === "VENCIDA"
                ? `linear-gradient(90deg, ${P.red}, #cc5555)`
                : `linear-gradient(90deg, ${P.yellow}, #cc9900)`,
            }} />

            {/* HERO SECTION */}
            <div style={{ padding: "32px 36px 28px", borderBottom: `1px solid ${P.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: P.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 500 }}>
                    Certificado de Garantía
                  </div>
                  <div style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 6 }}>
                    {warranty.product}
                  </div>
                  <div style={{ fontSize: 13, color: P.muted }}>
                    {warranty.userId?.businessName || "Garantix"}
                  </div>
                </div>
                <StatusBadge status={warranty.status} />
              </div>

              {/* BARRA DE VIGENCIA */}
              <VigenciaBar startDate={warranty.startDate} endDate={warranty.endDate} />
            </div>

            {/* DETALLES */}
            <div style={{ padding: "8px 36px 28px" }}>
              <div style={{ paddingTop: 8 }}>
                <DetailRow label="ID de Garantía"    value={warranty.warrantyCode}           mono highlight />
                <DetailRow label="Titular"            value={warranty.clientId?.name} />
                <DetailRow label="Producto / Servicio" value={warranty.product} />
                {warranty.description && <DetailRow label="Descripción" value={warranty.description} />}
                {warranty.invoiceNumber && <DetailRow label="N° de Factura" value={warranty.invoiceNumber} mono />}
                <DetailRow label="Fecha de Compra"   value={fmt(warranty.purchaseDate)} />
                <DetailRow label="Inicio de Garantía" value={fmt(warranty.startDate)} />
                <DetailRow label="Vencimiento"        value={fmt(warranty.endDate)} highlight />
                <DetailRow label="Negocio Emisor"     value={warranty.userId?.businessName} />
              </div>
            </div>
          </div>

          {/* TARJETA DE EMISIÓN */}
          <div className="gp-fade-3" style={{
            width: "100%", maxWidth: 680,
            background: P.card, border: `1px solid ${P.border}`,
            borderRadius: 16, padding: "20px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 20, flexWrap: "wrap",
            marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: "rgba(0,214,143,0.08)", border: `1px solid rgba(0,214,143,0.2)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="3" stroke={P.green} strokeWidth="1.6" />
                  <path d="M3 9H21" stroke={P.green} strokeWidth="1.6" />
                  <path d="M8 2V6M16 2V6" stroke={P.green} strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: P.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Fecha de emisión</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{fmt(generatedAt)}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: "rgba(0,214,143,0.08)", border: `1px solid rgba(0,214,143,0.2)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke={P.green} strokeWidth="1.6" />
                  <path d="M12 7V12L15 14" stroke={P.green} strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: P.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Hora de emisión</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{fmtTime(generatedAt)}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: "rgba(0,214,143,0.08)", border: `1px solid rgba(0,214,143,0.2)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
                    stroke={P.green} strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M9 12L11 14L15 10" stroke={P.green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: P.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Estado actual</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: warranty.status === "ACTIVA" ? P.green : warranty.status === "VENCIDA" ? P.red : P.yellow }}>
                  {warranty.status}
                </div>
              </div>
            </div>
          </div>

          {/* NOTA LEGAL */}
          <div className="gp-fade-4" style={{
            width: "100%", maxWidth: 680,
            padding: "16px 24px",
            background: "rgba(0,214,143,0.04)",
            border: `1px solid rgba(0,214,143,0.1)`,
            borderRadius: 12,
            marginBottom: 32,
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10" stroke={P.green} strokeWidth="1.6" />
                <path d="M12 8V12M12 16H12.01" stroke={P.green} strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <p style={{ fontSize: 12, color: P.muted, lineHeight: 1.7 }}>
                Este certificado es un documento digital válido emitido por <strong style={{ color: P.text }}>{warranty.userId?.businessName}</strong> a través de la plataforma <strong style={{ color: P.green }}>Garantix</strong>. Puede ser verificado en cualquier momento en el sistema.
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="gp-fade-5" style={{ textAlign: "center" }}>
            <GarantixLogo size={59} alignIt="center" />
            <div style={{ marginTop: 10, fontSize: 11, color: P.muted, letterSpacing: "0.04em" }}>
              Garantix by DEVRA · Unisabaneta · {new Date().getFullYear()}
            </div>
          </div>
        </>)}
      </div>
    </>
  );
}
