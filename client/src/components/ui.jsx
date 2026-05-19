// components/ui.jsx — Componentes de UI compartidos en toda la app

import { useState } from "react";
import { apiFetch } from "../scripts/api.js";
import { T, cfgInputStyle, cfgLabelStyle } from "../styles/tokens.js";

/* ── Logo ─────────────────────────────────── */
export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36, background: T.greenSoft,
        border: `1px solid rgba(0,214,143,0.3)`, borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
            stroke={T.green} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 12L11 14L15 10" stroke={T.green} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 700 }}>
        Garan<span style={{ color: T.green }}>tix</span>
      </span>
    </div>
  );
}

/* ── Badge de estado ─────────────────────── */
export function Badge({ status }) {
  const map = {
    ACTIVA:      { bg: "rgba(0,214,143,0.12)",  color: T.green,  border: "rgba(0,214,143,0.2)"  },
    ACTIVO:      { bg: "rgba(0,214,143,0.12)",  color: T.green,  border: "rgba(0,214,143,0.2)"  },
    VENCIDA:     { bg: "rgba(255,80,80,0.10)",  color: T.red,    border: "rgba(255,80,80,0.2)"  },
    INACTIVO:    { bg: "rgba(255,80,80,0.10)",  color: T.red,    border: "rgba(255,80,80,0.2)"  },
    RECLAMACIÓN: { bg: "rgba(255,180,0,0.10)",  color: T.yellow, border: "rgba(255,180,0,0.2)"  },
    RESUELTA:    { bg: "rgba(26,127,221,0.12)", color: T.blue,   border: "rgba(26,127,221,0.2)" },
    PENDIENTE:   { bg: "rgba(255,180,0,0.10)",  color: T.yellow, border: "rgba(255,180,0,0.2)"  },
    EN_PROCESO:  { bg: "rgba(26,127,221,0.12)", color: T.blue,   border: "rgba(26,127,221,0.2)" },
  };
  const s = map[status] || map.ACTIVA;
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{status}</span>
  );
}

/* ── Spinner de carga ────────────────────── */
export function Spinner({ size = 18 }) {
  return <i className="ti ti-loader-2 gtx-spin" style={{ fontSize: size, color: T.green }} />;
}

/* ── Mensaje de éxito / error ────────────── */
export function Feedback({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "9px 14px", borderRadius: 8, fontSize: 13,
      background: msg.type === "ok" ? "rgba(0,214,143,0.08)" : "rgba(255,107,107,0.08)",
      border: `1px solid ${msg.type === "ok" ? "rgba(0,214,143,0.2)" : "rgba(255,107,107,0.2)"}`,
      color: msg.type === "ok" ? T.green : T.red,
    }}>
      <i className={`ti ${msg.type === "ok" ? "ti-circle-check" : "ti-alert-circle"}`} style={{ fontSize: 16 }} />
      {msg.text}
    </div>
  );
}

/* ── Estado vacío ────────────────────────── */
export function EmptyState({ icon, title, sub }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 8, padding: 40,
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 36, color: T.muted, opacity: 0.3 }} />
      <div style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: T.muted }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted, opacity: 0.6, textAlign: "center" }}>{sub}</div>}
    </div>
  );
}

/* ── Sidebar ─────────────────────────────── */
export function Sidebar({ active, setPage }) {
  const items = [
    { key: "nueva",         icon: "ti-plus",             label: "Nueva Garantía",       special: true },
    { key: "dashboard",     icon: "ti-layout-dashboard", label: "Dashboard" },
    { key: "validar",       icon: "ti-qrcode",           label: "Validar QR" },
    { key: "clientes",      icon: "ti-users",            label: "Clientes" },
    { key: "config",        icon: "ti-settings",         label: "Configuración" },
    { key: "reclamaciones", icon: "ti-clipboard-list",   label: "Garantías Reclamadas" },
  ];
  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: T.navy2,
      borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
        <Logo />
      </div>
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {items.map(({ key, icon, label, special }) => {
          const isActive = active === key;
          const isReclamaciones = key === "reclamaciones";
          return (
            <button key={key} onClick={() => setPage(key)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8,
              fontSize: 13.5,
              fontWeight: special || isActive ? 600 : 400,
              color:      special ? T.navy : isActive ? T.green : isReclamaciones ? T.yellow : T.muted,
              background: special ? T.green : isActive ? T.greenSoft : isReclamaciones && !isActive ? "rgba(255,180,0,0.06)" : "none",
              border: isReclamaciones && !isActive ? "1px solid rgba(255,180,0,0.15)" : "none",
              width: "100%", textAlign: "left",
              cursor: "pointer",
              marginBottom: special ? 16 : key === "config" ? 2 : 2,
              marginTop: isReclamaciones ? 8 : 0,
              transition: "all 0.15s",
            }}>
              <i className={`ti ${icon}`} style={{ fontSize: 16 }} />
              {label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
        Garantix by DEVRA<br />Unisabaneta · 2026
      </div>
    </aside>
  );
}

/* ── TopBar ──────────────────────────────── */
export function TopBar({ title, action }) {
  return (
    <div style={{
      padding: "20px 28px 0",
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    }}>
      <div>
        <div style={{ fontSize: 12, color: T.muted, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>
          Bienvenido
        </div>
        <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
          {title}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ── QRPanel (validación lateral) ───────── */
export function QRPanel() {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const validate = async () => {
    if (!code.trim()) return;
    setLoading(true); setResult(null);
    try {
      const data = await apiFetch(`/api/warranties/public/${encodeURIComponent(code.trim())}`);
      setResult({ ok: true, warranty: data.warranty });
    } catch {
      setResult({ ok: false });
    } finally {
      setLoading(false);
    }
  };

  const corners = [
    ["tl","3px 0 0 3px","3px 0 0 3px"],["tr","3px 3px 0 0","0 3px 0 0"],
    ["bl","0 0 3px 3px","0 0 0 3px"],  ["br","0 3px 3px 0","0 0 3px 0"],
  ];

  return (
    <div style={{
      background: T.navy3, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: 18,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
    }}>
      <span style={{ fontFamily: "Syne", fontSize: 13, fontWeight: 600, alignSelf: "flex-start" }}>
        Validación Rápida
      </span>

      <div style={{
        width: 110, height: 110, border: `2px solid rgba(0,214,143,0.3)`,
        borderRadius: 10, position: "relative", background: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {corners.map(([k, bw, br]) => (
          <div key={k} style={{
            position: "absolute", width: 14, height: 14,
            borderColor: T.green, borderStyle: "solid", borderWidth: bw, borderRadius: br,
            ...(k==="tl"?{top:-2,left:-2}:k==="tr"?{top:-2,right:-2}:k==="bl"?{bottom:-2,left:-2}:{bottom:-2,right:-2}),
          }} />
        ))}
        <i className="ti ti-qrcode" style={{ fontSize: 40, color: T.muted, opacity: 0.4 }} />
      </div>

      <div style={{ width: "100%" }}>
        <input
          value={code}
          onChange={e => { setCode(e.target.value); setResult(null); }}
          onKeyDown={e => e.key === "Enter" && validate()}
          placeholder="Ej. #GTX-9901"
          style={{
            width: "100%", background: "rgba(0,0,0,0.25)",
            border: `1px solid ${T.border}`, borderRadius: 7,
            padding: "9px 12px", fontSize: 12, color: T.text,
            outline: "none", marginBottom: 8,
          }}
        />
        <button
          onClick={validate}
          disabled={loading || !code.trim()}
          style={{
            width: "100%", background: T.green, color: T.navy,
            border: "none", borderRadius: 7, padding: 10,
            fontSize: 12.5, fontWeight: 700, letterSpacing: "0.05em",
            cursor: "pointer", textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <Spinner size={14} /> : <i className="ti ti-search" style={{ fontSize: 14 }} />}
          Validar QR o ID
        </button>
      </div>

      {result && (
        <div className="gtx-fade" style={{
          width: "100%", padding: 10, borderRadius: 8,
          background: result.ok ? "rgba(0,214,143,0.08)" : "rgba(255,107,107,0.08)",
          border: `1px solid ${result.ok ? "rgba(0,214,143,0.2)" : "rgba(255,107,107,0.2)"}`,
        }}>
          {result.ok ? (
            <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ color: T.green, fontWeight: 700, fontFamily: "Syne" }}>✓ {result.warranty.warrantyCode}</div>
              <div style={{ color: T.muted }}>{result.warranty.product}</div>
              <div style={{ color: T.muted }}>Cliente: {result.warranty.clientId?.name}</div>
              <Badge status={result.warranty.status} />
            </div>
          ) : (
            <div style={{ fontSize: 12, color: T.red, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-shield-x" style={{ fontSize: 14 }} /> No encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── SectionCard (para Configuración) ───── */
export function SectionCard({ icon, title, children }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 18, color: T.green }} />
        <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

/* ── PwInput (para Configuración) ───────── */
export function PwInput({ label, value, onChange, show, onToggleShow }) {
  return (
    <div>
      <label style={cfgLabelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className="gtx-config-input"
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          style={{ ...cfgInputStyle, paddingRight: 40 }}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggleShow}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: T.muted, fontSize: 16, display: "flex", alignItems: "center",
          }}
        >
          <i className={`ti ${show ? "ti-eye-off" : "ti-eye"}`} />
        </button>
      </div>
    </div>
  );
}