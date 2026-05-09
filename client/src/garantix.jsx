import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  navy:       "#0B1628",
  navy2:      "#0F1E38",
  navy3:      "#162340",
  green:      "#00D68F",
  greenDim:   "#00b87a",
  greenSoft:  "rgba(0,214,143,0.12)",
  blue:       "#1A7FDD",
  blueSoft:   "rgba(26,127,221,0.15)",
  text:       "#E8EDF5",
  muted:      "#7A8FA8",
  border:     "rgba(255,255,255,0.07)",
  card:       "rgba(255,255,255,0.04)",
  cardHover:  "rgba(255,255,255,0.07)",
  red:        "#FF6B6B",
  yellow:     "#FFC947",
};

const API = "http://localhost:3001";

/* Helper fetch con credentials */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error del servidor");
  return data;
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${T.navy};
    color: ${T.text};
    min-height: 100vh;
    overflow: hidden;
  }

  input, select, textarea, button { font-family: 'DM Sans', sans-serif; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }

  @keyframes scanMove {
    0%   { top: 8%; }
    50%  { top: 88%; }
    100% { top: 8%; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .gtx-fade { animation: fadeIn 0.25s ease both; }
  .gtx-spin { animation: spin 0.8s linear infinite; display: inline-block; }

  .gtx-config-input:focus {
    border-color: rgba(0,214,143,0.45) !important;
    box-shadow: 0 0 0 3px rgba(0,214,143,0.07);
    outline: none;
  }

  .gtx-row:hover { background: rgba(255,255,255,0.03); }
`;

/* ─────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────── */
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 36, height: 36, background: T.greenSoft, border: `1px solid rgba(0,214,143,0.3)`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" stroke={T.green} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 12L11 14L15 10" stroke={T.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 700 }}>Garan<span style={{ color: T.green }}>tix</span></span>
    </div>
  );
}

function Badge({ status }) {
  const map = {
    ACTIVA:      { bg: "rgba(0,214,143,0.12)",   color: T.green,  border: "rgba(0,214,143,0.2)"  },
    ACTIVO:      { bg: "rgba(0,214,143,0.12)",   color: T.green,  border: "rgba(0,214,143,0.2)"  },
    VENCIDA:     { bg: "rgba(255,80,80,0.10)",   color: T.red,    border: "rgba(255,80,80,0.2)"  },
    INACTIVO:    { bg: "rgba(255,80,80,0.10)",   color: T.red,    border: "rgba(255,80,80,0.2)"  },
    RECLAMACIÓN: { bg: "rgba(255,180,0,0.10)",   color: T.yellow, border: "rgba(255,180,0,0.2)"  },
    RESUELTA:    { bg: "rgba(26,127,221,0.12)",  color: T.blue,   border: "rgba(26,127,221,0.2)" },
    PENDIENTE:   { bg: "rgba(255,180,0,0.10)",   color: T.yellow, border: "rgba(255,180,0,0.2)"  },
    EN_PROCESO:  { bg: "rgba(26,127,221,0.12)",  color: T.blue,   border: "rgba(26,127,221,0.2)" },
  };
  const s = map[status] || map.ACTIVA;
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

function Spinner({ size = 18 }) {
  return <i className="ti ti-loader-2 gtx-spin" style={{ fontSize: size, color: T.green }} />;
}

function Feedback({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 8, fontSize: 13, background: msg.type === "ok" ? "rgba(0,214,143,0.08)" : "rgba(255,107,107,0.08)", border: `1px solid ${msg.type === "ok" ? "rgba(0,214,143,0.2)" : "rgba(255,107,107,0.2)"}`, color: msg.type === "ok" ? T.green : T.red }}>
      <i className={`ti ${msg.type === "ok" ? "ti-circle-check" : "ti-alert-circle"}`} style={{ fontSize: 16 }} />
      {msg.text}
    </div>
  );
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 40 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 36, color: T.muted, opacity: 0.3 }} />
      <div style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600, color: T.muted }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted, opacity: 0.6, textAlign: "center" }}>{sub}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   QR PANEL — validación rápida lateral
───────────────────────────────────────────── */
function QRPanel() {
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null); // null | { ok, warranty } | { ok: false }

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

  return (
    <div style={{ background: T.navy3, border: `1px solid ${T.border}`, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <span style={{ fontFamily: "Syne", fontSize: 13, fontWeight: 600, alignSelf: "flex-start" }}>Validación Rápida</span>
      <div style={{ width: 110, height: 110, border: `2px solid rgba(0,214,143,0.3)`, borderRadius: 10, position: "relative", background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {[["tl","3px 0 0 3px","3px 0 0 3px"],["tr","3px 3px 0 0","0 3px 0 0"],["bl","0 0 3px 3px","0 0 0 3px"],["br","0 3px 3px 0","0 0 3px 0"]].map(([k,bw,br]) => (
          <div key={k} style={{ position: "absolute", width: 14, height: 14, borderColor: T.green, borderStyle: "solid", borderWidth: bw, borderRadius: br, ...(k==="tl"?{top:-2,left:-2}:k==="tr"?{top:-2,right:-2}:k==="bl"?{bottom:-2,left:-2}:{bottom:-2,right:-2}) }} />
        ))}
        <i className="ti ti-qrcode" style={{ fontSize: 40, color: T.muted, opacity: 0.4 }} />
      </div>
      <div style={{ width: "100%" }}>
        <input
          value={code}
          onChange={e => { setCode(e.target.value); setResult(null); }}
          onKeyDown={e => e.key === "Enter" && validate()}
          placeholder="Ej. #GTX-9901"
          style={{ width: "100%", background: "rgba(0,0,0,0.25)", border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 12px", fontSize: 12, color: T.text, outline: "none", marginBottom: 8 }}
        />
        <button onClick={validate} disabled={loading || !code.trim()} style={{ width: "100%", background: T.green, color: T.navy, border: "none", borderRadius: 7, padding: 10, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: loading ? 0.7 : 1 }}>
          {loading ? <Spinner size={14} /> : <i className="ti ti-search" style={{ fontSize: 14 }} />}
          Validar QR o ID
        </button>
      </div>
      {result && (
        <div className="gtx-fade" style={{ width: "100%", padding: 10, borderRadius: 8, background: result.ok ? "rgba(0,214,143,0.08)" : "rgba(255,107,107,0.08)", border: `1px solid ${result.ok ? "rgba(0,214,143,0.2)" : "rgba(255,107,107,0.2)"}` }}>
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

function Sidebar({ active, setPage }) {
  const items = [
    { key: "nueva",     icon: "ti-plus",             label: "Nueva Garantía", special: true },
    { key: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
    { key: "validar",   icon: "ti-qrcode",           label: "Validar QR" },
    { key: "clientes",  icon: "ti-users",            label: "Clientes" },
    { key: "config",    icon: "ti-settings",         label: "Configuración" },
  ];
  return (
    <aside style={{ width: 220, minHeight: "100vh", background: T.navy2, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}><Logo /></div>
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {items.map(({ key, icon, label, special }) => {
          const isActive = active === key;
          return (
            <button key={key} onClick={() => setPage(key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 13.5, fontWeight: special || isActive ? 600 : 400, color: special ? T.navy : isActive ? T.green : T.muted, background: special ? T.green : isActive ? T.greenSoft : "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", marginBottom: special ? 16 : 2, transition: "all 0.15s" }}>
              <i className={`ti ${icon}`} style={{ fontSize: 16 }} />{label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>Garantix by DEVRA<br />Unisabaneta · 2026</div>
    </aside>
  );
}

function TopBar({ title, action }) {
  return (
    <div style={{ padding: "20px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 12, color: T.muted, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 2 }}>Bienvenido</div>
        <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</div>
      </div>
      {action}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: DASHBOARD  (datos reales)
───────────────────────────────────────────── */
function Dashboard({ setPage }) {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/stats")
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = d => d ? new Date(d).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" }) : "-";

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Garantías Activas",       value: loading ? "…" : stats?.warranties?.active ?? 0, icon: "ti-shield-check",   accent: true  },
            { label: "Reclamaciones Pendientes", value: loading ? "…" : stats?.claims?.pending   ?? 0, icon: "ti-alert-triangle", accent: false },
          ].map(({ label, value, icon, accent }) => (
            <div key={label} style={{ background: accent ? T.blueSoft : T.card, border: `1px solid ${accent ? "rgba(26,127,221,0.25)" : T.border}`, borderRadius: 12, padding: "16px 18px", position: "relative" }}>
              <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: "Syne", fontSize: 36, fontWeight: 700, color: accent ? "#5BAEFF" : T.text }}>{value}</div>
              <i className={`ti ${icon}`} style={{ position: "absolute", top: 14, right: 16, fontSize: 20, color: T.muted, opacity: 0.4 }} />
            </div>
          ))}
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", flex: 1 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600 }}>Garantías Recientes</span>
            <button onClick={() => setPage("nueva")} style={{ fontSize: 12, color: T.green, border: "none", background: "none", cursor: "pointer" }}>+ Nueva →</button>
          </div>
          <div style={{ overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 32, display: "flex", justifyContent: "center" }}><Spinner size={24} /></div>
            ) : stats?.recentWarranties?.length === 0 ? (
              <EmptyState icon="ti-shield-off" title="Sin garantías aún" sub="Crea tu primera garantía" />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["ID","Cliente","Producto","Fecha","Estado"].map(h => (
                      <th key={h} style={{ padding: "10px 18px", fontSize: 11, color: T.muted, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentWarranties || []).map(g => (
                    <tr key={g._id} className="gtx-row" style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "11px 18px", fontFamily: "Syne", fontSize: 12, color: T.green, fontWeight: 600 }}>{g.warrantyCode}</td>
                      <td style={{ padding: "11px 18px", fontSize: 13 }}>{g.clientId?.name || "-"}</td>
                      <td style={{ padding: "11px 18px", fontSize: 13 }}>{g.product}</td>
                      <td style={{ padding: "11px 18px", fontSize: 13, color: T.muted }}>{fmt(g.createdAt)}</td>
                      <td style={{ padding: "11px 18px" }}><Badge status={g.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <QRPanel />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Resumen General</div>
          {loading ? <div style={{ display:"flex", justifyContent:"center", padding:16 }}><Spinner /></div> : [
            { label: "Total garantías",       val: stats?.warranties?.total    ?? 0, color: T.text   },
            { label: "Vencidas",              val: stats?.warranties?.expired  ?? 0, color: T.red    },
            { label: "En reclamación",        val: stats?.warranties?.inClaim  ?? 0, color: T.yellow },
            { label: "Total clientes",        val: stats?.clients?.total       ?? 0, color: T.green  },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12.5 }}>
              <span style={{ color: T.muted }}>{label}</span>
              <span style={{ color, fontWeight: 500 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: NUEVA GARANTÍA  (funcional)
───────────────────────────────────────────── */
function NuevaGarantia({ setPage }) {
  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "",
    product: "", invoiceNumber: "", purchaseDate: "",
    duration: "6", durationFrom: "today",
  });
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);
  const [created, setCreated] = useState(null); // garantía recién creada

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const calcDates = () => {
    const base = form.durationFrom === "today"
      ? new Date()
      : form.purchaseDate ? new Date(form.purchaseDate) : new Date();
    const start = new Date(base);
    const end   = new Date(base);
    end.setMonth(end.getMonth() + parseInt(form.duration));
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  const handleSubmit = async () => {
    const { clientName, clientEmail, product, purchaseDate } = form;
    if (!clientName || !clientEmail || !product || !purchaseDate) {
      setMsg({ type: "err", text: "Nombre, email, producto y fecha de compra son obligatorios" });
      return;
    }
    setSaving(true); setMsg(null);
    try {
      // 1. Crear o encontrar cliente
      let clientId;
      try {
        const clientsData = await apiFetch(`/api/clients?search=${encodeURIComponent(clientEmail)}`);
        const existing = clientsData.clients?.find(c => c.email.toLowerCase() === clientEmail.toLowerCase());
        if (existing) {
          clientId = existing._id;
        } else {
          const newClient = await apiFetch("/api/clients", {
            method: "POST",
            body: JSON.stringify({ name: clientName, email: clientEmail, phone: form.clientPhone }),
          });
          clientId = newClient.client._id;
        }
      } catch {
        const newClient = await apiFetch("/api/clients", {
          method: "POST",
          body: JSON.stringify({ name: clientName, email: clientEmail, phone: form.clientPhone }),
        });
        clientId = newClient.client._id;
      }

      // 2. Crear garantía
      const { startDate, endDate } = calcDates();
      const result = await apiFetch("/api/warranties", {
        method: "POST",
        body: JSON.stringify({
          clientId, product: form.product,
          invoiceNumber: form.invoiceNumber,
          purchaseDate: new Date(form.purchaseDate).toISOString(),
          startDate, endDate,
        }),
      });

      setCreated(result.warranty);
      setMsg({ type: "ok", text: `Garantía ${result.warranty.warrantyCode} creada exitosamente` });
      setForm({ clientName:"", clientEmail:"", clientPhone:"", product:"", invoiceNumber:"", purchaseDate:"", duration:"6", durationFrom:"today" });
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Error al crear garantía" });
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = { background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 12px", fontSize: 13, color: T.text, outline: "none", width: "100%" };
  const labelStyle = { fontSize: 11.5, color: T.muted, marginBottom: 5, display: "block" };

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "auto" }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <i className="ti ti-shield-plus" style={{ fontSize: 18, color: T.green }} />
          <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Registrar Nueva Garantía</span>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
          {/* Sección cliente */}
          <div style={{ fontSize: 10.5, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>Datos del Cliente</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre del Cliente *</label>
              <input style={fieldStyle} value={form.clientName} onChange={set("clientName")} placeholder="Ej. Juan Gómez" />
            </div>
            <div>
              <label style={labelStyle}>Email del Cliente *</label>
              <input style={fieldStyle} type="email" value={form.clientEmail} onChange={set("clientEmail")} placeholder="correo@ejemplo.com" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Teléfono del Cliente</label>
              <input style={fieldStyle} type="tel" value={form.clientPhone} onChange={set("clientPhone")} placeholder="+57 300 000 0000" />
            </div>
            <div>
              <label style={labelStyle}>Número de Factura</label>
              <input style={fieldStyle} value={form.invoiceNumber} onChange={set("invoiceNumber")} placeholder="Ej. FAC-20260001" />
            </div>
          </div>

          {/* Sección producto */}
          <div style={{ fontSize: 10.5, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>Detalles del Producto</div>
          <div>
            <label style={labelStyle}>Descripción del Producto / Servicio *</label>
            <textarea style={{ ...fieldStyle, resize: "none", height: 72, lineHeight: 1.5 }} value={form.product} onChange={set("product")} placeholder="Ej. Reparación TV Samsung 55', cambio de panel..." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Fecha de Compra *</label>
              <input type="date" style={{ ...fieldStyle, colorScheme: "dark" }} value={form.purchaseDate} onChange={set("purchaseDate")} />
            </div>
            <div>
              <label style={labelStyle}>Duración de la Garantía</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <select style={{ ...fieldStyle, cursor: "pointer" }} value={form.duration} onChange={set("duration")}>
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">1 año</option>
                  <option value="24">2 años</option>
                </select>
                <select style={{ ...fieldStyle, cursor: "pointer" }} value={form.durationFrom} onChange={set("durationFrom")}>
                  <option value="today">Desde hoy</option>
                  <option value="purchase">Desde factura</option>
                </select>
              </div>
            </div>
          </div>

          {msg && <Feedback msg={msg} />}

          {/* Garantía creada: mostrar código */}
          {created && (
            <div className="gtx-fade" style={{ background: "rgba(0,214,143,0.06)", border: "1px solid rgba(0,214,143,0.2)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: "Syne", fontSize: 13, fontWeight: 600, color: T.green }}>🎉 Garantía generada</div>
              <div style={{ fontSize: 12, color: T.muted }}>
                <strong style={{ color: T.text }}>Código:</strong> {created.warrantyCode}<br />
                <strong style={{ color: T.text }}>QR URL:</strong> <a href={created.qrData} target="_blank" rel="noreferrer" style={{ color: T.green }}>{created.qrData}</a>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setPage("dashboard")} style={{ padding: "9px 20px", borderRadius: 7, border: `1px solid ${T.border}`, background: "none", color: T.muted, cursor: "pointer", fontSize: 13 }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 7, background: T.green, color: T.navy, border: "none", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? <Spinner size={14} /> : <i className="ti ti-qrcode" style={{ fontSize: 16 }} />}
            {saving ? "Guardando..." : "Generar Garantía y QR"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <QRPanel />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>¿Qué se generará?</div>
          {[
            { icon: "ti-hash",         text: <>Un ID único tipo <strong style={{ color: T.text }}>#GTX-XXXX</strong></> },
            { icon: "ti-qrcode",       text: "Código QR vinculado al ID para validación instantánea" },
            { icon: "ti-shield-check", text: <>Registro con estado <strong style={{ color: T.green }}>ACTIVA</strong></> },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none", fontSize: 12 }}>
              <i className={`ti ${icon}`} style={{ fontSize: 14, color: T.green, marginTop: 1 }} />
              <span style={{ color: T.muted, lineHeight: 1.4 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: VALIDAR QR  (funcional)
───────────────────────────────────────────── */
function ValidarQR() {
  const [cameraOn, setCameraOn] = useState(false);
  const [code, setCode]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null); // null | { ok, warranty } | { ok:false }

  const validate = async (searchCode) => {
    const c = (searchCode || code).trim();
    if (!c) return;
    setLoading(true); setResult(null);
    try {
      const data = await apiFetch(`/api/warranties/public/${encodeURIComponent(c)}`);
      setResult({ ok: true, warranty: data.warranty });
    } catch {
      setResult({ ok: false });
    } finally {
      setLoading(false);
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" }) : "-";

  const resultBorder = result === null ? T.border : result.ok ? "rgba(0,214,143,0.3)" : "rgba(255,107,107,0.3)";

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", flex: 1 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <i className="ti ti-qrcode" style={{ fontSize: 18, color: T.green }} />
            <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Validación de Garantía</span>
          </div>
          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Columna cámara */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenSoft, border: `1px solid rgba(0,214,143,0.3)`, color: T.green, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
                Escanear Código QR
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${cameraOn ? "rgba(0,214,143,0.5)" : T.border}`, borderRadius: 10, aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, position: "relative", overflow: "hidden" }}>
                {cameraOn && <div style={{ position: "absolute", left: "10%", right: "10%", height: 2, background: `linear-gradient(90deg, transparent, ${T.green}, transparent)`, animation: "scanMove 2s ease-in-out infinite" }} />}
                {[["tl","3px 0 0 3px","3px 0 0 3px"],["tr","3px 3px 0 0","0 3px 0 0"],["bl","0 0 3px 3px","0 0 0 3px"],["br","0 3px 3px 0","0 0 3px 0"]].map(([k,bw,br]) => (
                  <div key={k} style={{ position: "absolute", width: 18, height: 18, borderColor: T.green, borderStyle: "solid", borderWidth: bw, borderRadius: br, opacity: 0.7, ...(k==="tl"?{top:10,left:10}:k==="tr"?{top:10,right:10}:k==="bl"?{bottom:10,left:10}:{bottom:10,right:10}) }} />
                ))}
                {!cameraOn && <i className="ti ti-camera" style={{ fontSize: 36, color: T.muted, opacity: 0.4 }} />}
                <span style={{ fontSize: 12, color: cameraOn ? T.green : T.muted }}>{cameraOn ? "Escaneando..." : "Apunta la cámara al código QR"}</span>
                <button onClick={() => setCameraOn(c => !c)} style={{ marginTop: 4, padding: "8px 16px", background: T.greenSoft, color: T.green, border: `1px solid rgba(0,214,143,0.3)`, borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ti ti-camera" style={{ fontSize: 14 }} />{cameraOn ? "Detener Cámara" : "Activar Cámara"}
                </button>
              </div>
              {/* Búsqueda manual */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={code}
                  onChange={e => { setCode(e.target.value); setResult(null); }}
                  onKeyDown={e => e.key === "Enter" && validate()}
                  placeholder="O ingresa el ID manualmente: #GTX-XXXX"
                  style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 12px", fontSize: 12, color: T.text, outline: "none" }}
                />
                <button onClick={() => validate()} disabled={loading || !code.trim()} style={{ padding: "9px 14px", background: T.green, color: T.navy, border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  {loading ? <Spinner size={14} /> : <i className="ti ti-search" style={{ fontSize: 14 }} />}
                </button>
              </div>
            </div>

            {/* Columna resultado */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenSoft, border: `1px solid rgba(0,214,143,0.3)`, color: T.green, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
                Resultado
              </div>
              <div style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${resultBorder}`, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 200, transition: "border-color 0.3s" }}>
                {result === null && !loading && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <i className="ti ti-shield-search" style={{ fontSize: 32, color: T.muted, opacity: 0.3 }} />
                    <p style={{ fontSize: 12, color: T.muted, textAlign: "center", lineHeight: 1.5 }}>Escanea un QR o ingresa un ID<br />para ver los detalles aquí</p>
                  </div>
                )}
                {loading && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size={28} /></div>
                )}
                {result?.ok && (
                  <div className="gtx-fade" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 12, color: T.muted }}>ID: <span style={{ color: T.green, fontWeight: 600 }}>{result.warranty.warrantyCode}</span></div>
                      <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, color: T.green }}>✓ VÁLIDA</div>
                      <Badge status={result.warranty.status} />
                    </div>
                    {[
                      ["Cliente",    result.warranty.clientId?.name],
                      ["Email",      result.warranty.clientId?.email],
                      ["Producto",   result.warranty.product],
                      ["Inicio",     fmt(result.warranty.startDate)],
                      ["Vence",      fmt(result.warranty.endDate)],
                      ["Negocio",    result.warranty.userId?.businessName],
                    ].map(([k, v], i, a) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < a.length-1 ? `1px solid ${T.border}` : "none", fontSize: 12.5 }}>
                        <span style={{ color: T.muted }}>{k}</span>
                        <span style={{ fontWeight: 500 }}>{v || "-"}</span>
                      </div>
                    ))}
                  </div>
                )}
                {result?.ok === false && (
                  <div className="gtx-fade" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <i className="ti ti-shield-x" style={{ fontSize: 32, color: T.red }} />
                    <div style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 700, color: T.red }}>No Encontrada</div>
                    <p style={{ fontSize: 12, color: T.muted, textAlign: "center", lineHeight: 1.5 }}>No existe ninguna garantía con ese<br />ID en el sistema.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <QRPanel />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Guía rápida</div>
          {[
            { icon: "ti-qrcode",         text: "Activa la cámara y apunta al QR del cliente para validar al instante" },
            { icon: "ti-keyboard",       text: "También puedes escribir el ID manualmente en el panel izquierdo" },
            { icon: "ti-alert-triangle", text: "Si la garantía es válida, podrás ver todos sus detalles" },
          ].map(({ icon, text }, i, a) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: i < a.length-1 ? `1px solid ${T.border}` : "none", fontSize: 12 }}>
              <i className={`ti ${icon}`} style={{ fontSize: 14, color: T.green, marginTop: 1 }} />
              <span style={{ color: T.muted, lineHeight: 1.4 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: CLIENTES  (datos reales)
───────────────────────────────────────────── */
function Clientes({ setPage }) {
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [msg,      setMsg]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/clients?search=${encodeURIComponent(search)}`);
      setClients(data.clients || []);
    } catch {
      setMsg({ type: "err", text: "Error al cargar clientes" });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;
    setDeleting(id);
    try {
      await apiFetch(`/api/clients/${id}`, { method: "DELETE" });
      setClients(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      setMsg({ type: "err", text: err.message });
    } finally {
      setDeleting(null); setOpenMenu(null);
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString("es-CO", { day:"2-digit", month:"short", year:"numeric" }) : "-";

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {msg && <div style={{ marginBottom: 10 }}><Feedback msg={msg} /></div>}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Directorio de Clientes</span>
              <span style={{ background: T.greenSoft, color: T.green, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, border: `1px solid rgba(0,214,143,0.2)` }}>{clients.length} clientes</span>
            </div>
            <div style={{ position: "relative" }}>
              <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: T.muted, pointerEvents: "none" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 12px 7px 32px", fontSize: 12.5, color: T.text, outline: "none", width: 200 }} />
            </div>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Spinner size={28} /></div>
            ) : clients.length === 0 ? (
              <EmptyState icon="ti-users-group" title="Sin clientes aún" sub={search ? "Ningún cliente coincide con la búsqueda" : "Los clientes se crean al registrar una garantía"} />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d1b30", position: "sticky", top: 0, zIndex: 1 }}>
                    {["Nombre","Email","Teléfono","Registrado","Estado",""].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, color: T.muted, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c, idx) => (
                    <tr key={c._id} className="gtx-row" style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>{c.name}</td>
                      <td style={{ padding: "11px 16px", fontSize: 12.5, color: T.muted }}>{c.email}</td>
                      <td style={{ padding: "11px 16px", fontSize: 12.5, color: T.muted, whiteSpace: "nowrap" }}>{c.phone || "-"}</td>
                      <td style={{ padding: "11px 16px", fontSize: 12.5, color: T.muted, whiteSpace: "nowrap" }}>{fmt(c.createdAt)}</td>
                      <td style={{ padding: "11px 16px" }}><Badge status={c.active ? "ACTIVO" : "INACTIVO"} /></td>
                      <td style={{ padding: "11px 16px", textAlign: "right", position: "relative" }}>
                        <button onClick={() => setOpenMenu(openMenu === idx ? null : idx)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", color: T.muted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>⋯</button>
                        {openMenu === idx && (
                          <div style={{ position: "absolute", right: 0, top: "calc(100% - 4px)", background: "#162340", border: `1px solid ${T.border}`, borderRadius: 8, padding: 4, zIndex: 10, minWidth: 170, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                            <button onClick={() => { setPage("nueva"); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: T.text, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}>
                              <i className="ti ti-shield-plus" style={{ fontSize: 15, color: T.muted }} /> Nueva Garantía
                            </button>
                            <div style={{ borderTop: `1px solid ${T.border}`, margin: "3px 0" }} />
                            <button onClick={() => handleDelete(c._id)} disabled={deleting === c._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: T.red, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}>
                              {deleting === c._id ? <Spinner size={14} /> : <i className="ti ti-trash" style={{ fontSize: 15, color: T.red }} />} Eliminar Cliente
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <QRPanel />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Resumen de Clientes</div>
          {[
            { label: "Total registrados",  val: clients.length,                                       color: T.text   },
            { label: "Clientes activos",   val: clients.filter(c => c.active).length,                 color: T.green  },
            { label: "Clientes inactivos", val: clients.filter(c => !c.active).length,                color: T.yellow },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12.5 }}>
              <span style={{ color: T.muted }}>{label}</span>
              <span style={{ color, fontWeight: 500 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: CONFIGURACIÓN  (funcional)
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   CONFIGURACIÓN — subcomponentes externos
   (definidos fuera para evitar re-mount en cada render)
───────────────────────────────────────────── */
const cfgInputStyle = { width: "100%", background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13.5, color: T.text, outline: "none", transition: "border-color 0.15s" };
const cfgLabelStyle = { fontSize: 12, color: T.muted, marginBottom: 5, display: "block", fontWeight: 500 };

function SectionCard({ icon, title, children }) {
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

function PwInput({ label, value, onChange, show, onToggleShow }) {
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
          style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 16, display: "flex", alignItems: "center" }}
        >
          <i className={`ti ${show ? "ti-eye-off" : "ti-eye"}`} />
        </button>
      </div>
    </div>
  );
}

function Configuracion({ user, onLogout }) {
  const [bizForm,       setBizForm]       = useState({ businessName: user?.businessName || "", email: user?.email || "", phone: "" });
  const [loadingProfile,setLoadingProfile] = useState(true);
  const [bizSaving,     setBizSaving]     = useState(false);
  const [bizMsg,        setBizMsg]        = useState(null);

  const [pwForm,    setPwForm]    = useState({ current: "", next: "", confirm: "" });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwMsg,     setPwMsg]     = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext,    setShowNext]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);

  // El JWT no guarda phone → cargamos datos frescos de la BD
  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(data => {
        if (data?.user) {
          setBizForm({
            businessName: data.user.businessName || "",
            email:        data.user.email        || "",
            phone:        data.user.phone        || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const setBiz = k => e => setBizForm(f => ({ ...f, [k]: e.target.value }));
  const setPw  = k => e => setPwForm(f  => ({ ...f, [k]: e.target.value }));

  const saveBiz = async () => {
    setBizSaving(true); setBizMsg(null);
    try {
      await apiFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ businessName: bizForm.businessName, phone: bizForm.phone }),
      });
      setBizMsg({ type: "ok", text: "Datos actualizados correctamente" });
    } catch (err) {
      setBizMsg({ type: "err", text: err.message || "Error al guardar" });
    } finally { setBizSaving(false); }
  };

  const savePw = async () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) { setPwMsg({ type: "err", text: "Completa todos los campos" }); return; }
    if (pwForm.next !== pwForm.confirm) { setPwMsg({ type: "err", text: "Las contraseñas nuevas no coinciden" }); return; }
    if (pwForm.next.length < 8) { setPwMsg({ type: "err", text: "Mínimo 8 caracteres" }); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      await apiFetch("/api/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      setPwMsg({ type: "ok", text: "Contraseña actualizada correctamente" });
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setPwMsg({ type: "err", text: err.message || "Error al cambiar contraseña" });
    } finally { setPwSaving(false); }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    onLogout();
  };



  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {loadingProfile ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <Spinner size={32} />
        </div>
      ) : (<>

      <SectionCard icon="ti-building-store" title="Datos del Negocio">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={cfgLabelStyle}>Nombre del Negocio</label>
            <input className="gtx-config-input" style={cfgInputStyle} value={bizForm.businessName} onChange={setBiz("businessName")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={cfgLabelStyle}>Email (solo lectura)</label>
              <input style={{ ...cfgInputStyle, opacity: 0.5 }} value={bizForm.email} readOnly />
            </div>
            <div>
              <label style={cfgLabelStyle}>Teléfono</label>
              <input className="gtx-config-input" type="tel" style={cfgInputStyle} value={bizForm.phone} onChange={setBiz("phone")} />
            </div>
          </div>
          <Feedback msg={bizMsg} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={saveBiz} disabled={bizSaving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 8, background: T.green, color: T.navy, border: "none", fontSize: 13, fontWeight: 700, cursor: bizSaving ? "not-allowed" : "pointer", opacity: bizSaving ? 0.7 : 1 }}>
              {bizSaving ? <Spinner size={14} /> : <i className="ti ti-device-floppy" style={{ fontSize: 16 }} />}
              {bizSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="ti-lock" title="Cambiar Contraseña">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PwInput
            label="Contraseña actual"
            value={pwForm.current}
            onChange={setPw("current")}
            show={showCurrent}
            onToggleShow={() => setShowCurrent(s => !s)}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <PwInput
              label="Nueva contraseña"
              value={pwForm.next}
              onChange={setPw("next")}
              show={showNext}
              onToggleShow={() => setShowNext(s => !s)}
            />
            <PwInput
              label="Confirmar nueva contraseña"
              value={pwForm.confirm}
              onChange={setPw("confirm")}
              show={showConfirm}
              onToggleShow={() => setShowConfirm(s => !s)}
            />
          </div>
          {pwForm.next && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4].map(i => {
                  const s = pwForm.next.length >= 12 ? 4 : pwForm.next.length >= 10 ? 3 : pwForm.next.length >= 8 ? 2 : 1;
                  return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= s ? (s===1?T.red:s===2?T.yellow:s===3?"#7EE8A2":T.green) : T.border, transition: "background 0.3s" }} />;
                })}
              </div>
              <span style={{ fontSize: 11, color: T.muted }}>{pwForm.next.length<8?"Muy corta":pwForm.next.length<10?"Débil":pwForm.next.length<12?"Buena":"Fuerte"}</span>
            </div>
          )}
          <Feedback msg={pwMsg} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={savePw} disabled={pwSaving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 8, background: T.green, color: T.navy, border: "none", fontSize: 13, fontWeight: 700, cursor: pwSaving ? "not-allowed" : "pointer", opacity: pwSaving ? 0.7 : 1 }}>
              {pwSaving ? <Spinner size={14} /> : <i className="ti ti-lock-check" style={{ fontSize: 16 }} />}
              {pwSaving ? "Guardando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon="ti-logout" title="Sesión">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Cerrar sesión</div>
            <div style={{ fontSize: 12.5, color: T.muted }}>Saldrás del panel y deberás volver a iniciar sesión.</div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 8, background: "rgba(255,107,107,0.1)", color: T.red, border: `1px solid rgba(255,107,107,0.2)`, fontSize: 13, fontWeight: 600, cursor: loggingOut ? "not-allowed" : "pointer", opacity: loggingOut ? 0.7 : 1 }}>
            {loggingOut ? <Spinner size={14} /> : <i className="ti ti-logout" style={{ fontSize: 16 }} />}
            {loggingOut ? "Cerrando..." : "Cerrar Sesión"}
          </button>
        </div>
      </SectionCard>

      </>)}
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────── */
export default function App({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const businessName = user?.businessName || "Mi Negocio";

  const pageActions = {
    dashboard: (
      <button onClick={() => setPage("nueva")} style={{ display: "flex", alignItems: "center", gap: 7, background: T.green, color: T.navy, border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        <i className="ti ti-plus" style={{ fontSize: 14 }} /> Crear Nueva Garantía
      </button>
    ),
    clientes: (
      <button onClick={() => setPage("nueva")} style={{ display: "flex", alignItems: "center", gap: 7, background: T.green, color: T.navy, border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        <i className="ti ti-plus" style={{ fontSize: 14 }} /> Crear Nueva Garantía
      </button>
    ),
  };

  const pages = {
    dashboard: (props) => <Dashboard {...props} setPage={setPage} />,
    nueva:     (props) => <NuevaGarantia {...props} setPage={setPage} />,
    validar:   (props) => <ValidarQR {...props} />,
    clientes:  (props) => <Clientes {...props} setPage={setPage} />,
    config:    (props) => <Configuracion {...props} user={user} onLogout={onLogout} />,
  };

  const PageComponent = pages[page];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar active={page} setPage={setPage} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <TopBar title={businessName} action={pageActions[page]} />
          <PageComponent setPage={setPage} />
        </div>
      </div>
    </>
  );
}