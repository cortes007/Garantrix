import { useState } from "react";

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

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────── */
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

  input, select, textarea, button {
    font-family: 'DM Sans', sans-serif;
  }

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

  .gtx-fade { animation: fadeIn 0.25s ease both; }
`;

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const GUARANTEES = [
  { id: "#GTX-9901", client: "Juan Gómez",    product: "Reparación TV Samsung",   start: "10/Mar/2026", end: "10/Sep/2026", status: "ACTIVA",      claims: 0 },
  { id: "#GTX-9902", client: "María López",   product: "Cambio Pantalla iPhone",  start: "08/Mar/2026", end: "08/Sep/2026", status: "ACTIVA",      claims: 1 },
  { id: "#GTX-9903", client: "Carlos Ríos",   product: "Reparación Laptop HP",    start: "05/Mar/2026", end: "05/Jun/2026", status: "RECLAMACIÓN", claims: 2 },
  { id: "#GTX-9904", client: "Ana Torres",    product: "Cambio Batería MacBook",  start: "01/Mar/2026", end: "01/Mar/2026", status: "VENCIDA",     claims: 0 },
  { id: "#GTX-9900", client: "Juan Gómez",    product: "Reparación TV Samsung",   start: "28/Feb/2026", end: "28/Aug/2026", status: "ACTIVA",      claims: 0 },
];

const CLIENTS = [
  { id: "#CL-101", name: "Juan Gómez",    email: "juan.g@email.com",    phone: "+57 300 111 2233", warranties: 5, lastActivity: "10/Mar/2026", status: "ACTIVO"   },
  { id: "#CL-102", name: "María López",   email: "m.lopez@email.com",   phone: "+57 310 222 3344", warranties: 2, lastActivity: "12/Mar/2026", status: "INACTIVO" },
  { id: "#CL-103", name: "Carlos Ríos",   email: "c.rios@email.com",    phone: "+57 320 333 4455", warranties: 2, lastActivity: "10/Mar/2026", status: "ACTIVO"   },
  { id: "#CL-104", name: "Ana Torres",    email: "a.torres@email.com",  phone: "+57 315 444 5566", warranties: 6, lastActivity: "10/Mar/2026", status: "ACTIVO"   },
  { id: "#CL-105", name: "Luis Herrera",  email: "l.herrera@email.com", phone: "+57 311 555 6677", warranties: 2, lastActivity: "08/Mar/2026", status: "INACTIVO" },
  { id: "#CL-106", name: "Sofía Méndez",  email: "s.mendez@email.com",  phone: "+57 318 666 7788", warranties: 2, lastActivity: "12/Mar/2026", status: "INACTIVO" },
  { id: "#CL-107", name: "Pedro Vargas",  email: "p.vargas@email.com",  phone: "+57 312 777 8899", warranties: 5, lastActivity: "14/Feb/2026", status: "ACTIVO"   },
];

/* ─────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────── */

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36,
        background: T.greenSoft,
        border: `1px solid rgba(0,214,143,0.3)`,
        borderRadius: 10,
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

function Badge({ status }) {
  const map = {
    ACTIVA:       { bg: "rgba(0,214,143,0.12)", color: T.green,  border: "rgba(0,214,143,0.2)" },
    ACTIVO:       { bg: "rgba(0,214,143,0.12)", color: T.green,  border: "rgba(0,214,143,0.2)" },
    VENCIDA:      { bg: "rgba(255,80,80,0.10)", color: T.red,    border: "rgba(255,80,80,0.2)"  },
    INACTIVO:     { bg: "rgba(255,80,80,0.10)", color: T.red,    border: "rgba(255,80,80,0.2)"  },
    RECLAMACIÓN:  { bg: "rgba(255,180,0,0.10)", color: T.yellow, border: "rgba(255,180,0,0.2)"  },
  };
  const s = map[status] || map.ACTIVA;
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px",
      borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{status}</span>
  );
}

function QRPanel() {
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
        width: 110, height: 110,
        border: `2px solid rgba(0,214,143,0.3)`,
        borderRadius: 10, position: "relative",
        background: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {[["tl","3px 0 0 3px","3px 0 0 3px"],["tr","3px 3px 0 0","0 3px 0 0"],
          ["bl","0 0 3px 3px","0 0 0 3px"],["br","0 3px 3px 0","0 0 3px 0"]].map(([k, bw, br]) => (
          <div key={k} style={{
            position: "absolute", width: 14, height: 14,
            borderColor: T.green, borderStyle: "solid", borderWidth: bw, borderRadius: br,
            ...(k==="tl"?{top:-2,left:-2}:k==="tr"?{top:-2,right:-2}:k==="bl"?{bottom:-2,left:-2}:{bottom:-2,right:-2}),
          }} />
        ))}
        <i className="ti ti-qrcode" style={{ fontSize: 40, color: T.muted, opacity: 0.4 }} />
      </div>
      <div style={{ width: "100%" }}>
        <input placeholder="Ingrese ID de garantía manualmente" style={{
          width: "100%", background: "rgba(0,0,0,0.25)",
          border: `1px solid ${T.border}`, borderRadius: 7,
          padding: "9px 12px", fontSize: 12, color: T.text,
          outline: "none", marginBottom: 8,
        }} />
        <button style={{
          width: "100%", background: T.green, color: T.navy,
          border: "none", borderRadius: 7, padding: 10,
          fontSize: 12.5, fontWeight: 700, letterSpacing: "0.05em",
          cursor: "pointer", textTransform: "uppercase",
        }}>Validar QR o ID</button>
      </div>
    </div>
  );
}

function Sidebar({ active, setPage }) {
  const items = [
    { key: "nueva",    icon: "ti-plus",             label: "Nueva Garantía", special: true },
    { key: "dashboard",icon: "ti-layout-dashboard", label: "Dashboard" },
    { key: "validar",  icon: "ti-qrcode",           label: "Validar QR" },
    { key: "clientes", icon: "ti-users",            label: "Clientes" },
    { key: "config",   icon: "ti-settings",         label: "Configuración" },
  ];
  return (
    <aside style={{
      width: 220, minHeight: "100vh",
      background: T.navy2, borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
        <Logo />
      </div>
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        {items.map(({ key, icon, label, special }) => {
          const isActive = active === key;
          return (
            <button key={key} onClick={() => setPage(key)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 12px", borderRadius: 8,
              fontSize: 13.5, fontWeight: special || isActive ? 600 : 400,
              color: special ? T.navy : isActive ? T.green : T.muted,
              background: special ? T.green : isActive ? T.greenSoft : "none",
              border: "none", width: "100%", textAlign: "left",
              cursor: "pointer", marginBottom: special ? 16 : 2,
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

function TopBar({ title, action }) {
  return (
    <div style={{ padding: "20px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
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

/* ─────────────────────────────────────────────
   PAGE: DASHBOARD
───────────────────────────────────────────── */
function Dashboard({ setPage }) {
  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Garantías Activas", value: "145", icon: "ti-shield-check", accent: true },
            { label: "Reclamaciones este mes", value: "8", icon: "ti-alert-triangle", accent: false },
          ].map(({ label, value, icon, accent }) => (
            <div key={label} style={{
              background: accent ? T.blueSoft : T.card,
              border: `1px solid ${accent ? "rgba(26,127,221,0.25)" : T.border}`,
              borderRadius: 12, padding: "16px 18px", position: "relative",
            }}>
              <div style={{ fontSize: 11.5, color: T.muted, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 8 }}>{label}</div>
              <div style={{ fontFamily: "Syne", fontSize: 36, fontWeight: 700, color: accent ? "#5BAEFF" : T.text }}>{value}</div>
              <i className={`ti ${icon}`} style={{ position: "absolute", top: 14, right: 16, fontSize: 20, color: T.muted, opacity: 0.4 }} />
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", flex: 1 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600 }}>Garantías Recientes</span>
            <button style={{ fontSize: 12, color: T.green, border: "none", background: "none", cursor: "pointer", fontFamily: "DM Sans" }}>Ver todas →</button>
          </div>
          <div style={{ overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["ID", "Cliente", "Producto", "Fecha Inicio", "Estado"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", fontSize: 11, color: T.muted, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GUARANTEES.map(g => (
                  <tr key={g.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: "11px 18px", fontFamily: "Syne", fontSize: 12, color: T.green, fontWeight: 600 }}>{g.id}</td>
                    <td style={{ padding: "11px 18px", fontSize: 13 }}>{g.client}</td>
                    <td style={{ padding: "11px 18px", fontSize: 13 }}>{g.product}</td>
                    <td style={{ padding: "11px 18px", fontSize: 13, color: T.muted }}>{g.start}</td>
                    <td style={{ padding: "11px 18px" }}><Badge status={g.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <QRPanel />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Resumen del mes</div>
          {[
            { label: "Garantías registradas", val: "23", color: T.green },
            { label: "Vencimientos próximos", val: "5",  color: T.yellow },
            { label: "Reclamaciones activas", val: "3",  color: T.red },
            { label: "Resueltas este mes",    val: "12", color: T.text },
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
   PAGE: NUEVA GARANTÍA
───────────────────────────────────────────── */
function NuevaGarantia({ setPage }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", invoice: "", description: "", purchaseDate: "", duration: "6 meses", durationFrom: "Desde hoy" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const fieldStyle = {
    background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`,
    borderRadius: 7, padding: "9px 12px", fontSize: 13, color: T.text,
    outline: "none", width: "100%",
  };
  const labelStyle = { fontSize: 11.5, color: T.muted, marginBottom: 5, display: "block" };

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "auto" }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <i className="ti ti-shield-plus" style={{ fontSize: 18, color: T.green }} />
          <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Registrar Nueva Garantía</span>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
          <div style={{ fontSize: 10.5, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>
            Datos del Cliente
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Nombre del Cliente</label><input style={fieldStyle} value={form.name} onChange={set("name")} placeholder="Ej. Juan Gómez" /></div>
            <div><label style={labelStyle}>Email del Cliente</label><input style={fieldStyle} type="email" value={form.email} onChange={set("email")} placeholder="correo@ejemplo.com" /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Teléfono del Cliente</label><input style={fieldStyle} type="tel" value={form.phone} onChange={set("phone")} placeholder="+57 300 000 0000" /></div>
            <div><label style={labelStyle}>Número de Factura</label><input style={fieldStyle} value={form.invoice} onChange={set("invoice")} placeholder="Ej. FAC-20260001" /></div>
          </div>

          <div style={{ fontSize: 10.5, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>
            Detalles del Producto
          </div>
          <div>
            <label style={labelStyle}>Descripción del Producto / Servicio</label>
            <textarea style={{ ...fieldStyle, resize: "none", height: 72, lineHeight: 1.5 }} value={form.description} onChange={set("description")} placeholder="Ej. Reparación TV Samsung 55', cambio de panel..." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Fecha de Compra</label><input type="date" style={{ ...fieldStyle, colorScheme: "dark" }} value={form.purchaseDate} onChange={set("purchaseDate")} /></div>
            <div>
              <label style={labelStyle}>Duración de la Garantía</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <select style={{ ...fieldStyle, cursor: "pointer" }} value={form.duration} onChange={set("duration")}>
                  {["3 meses","6 meses","1 año","2 años"].map(o => <option key={o}>{o}</option>)}
                </select>
                <select style={{ ...fieldStyle, cursor: "pointer" }} value={form.durationFrom} onChange={set("durationFrom")}>
                  {["Desde hoy","Desde factura","Personalizado"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setPage("dashboard")} style={{
            padding: "9px 20px", borderRadius: 7,
            border: `1px solid ${T.border}`, background: "none",
            color: T.muted, cursor: "pointer", fontSize: 13,
          }}>Cancelar</button>
          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 22px", borderRadius: 7,
            background: T.green, color: T.navy, border: "none",
            fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em",
          }}>
            <i className="ti ti-qrcode" style={{ fontSize: 16 }} />
            Generar Garantía y QR
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <QRPanel />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>¿Qué se generará?</div>
          {[
            { icon: "ti-hash",         text: <>Un ID único tipo <strong style={{ color: T.text }}>#GTX-XXXX</strong> para esta garantía</> },
            { icon: "ti-qrcode",       text: "Código QR vinculado al ID para validación instantánea" },
            { icon: "ti-mail",         text: "Correo automático al cliente con sus datos y el QR adjunto" },
            { icon: "ti-shield-check", text: <>Registro en el sistema con estado <strong style={{ color: T.green }}>ACTIVA</strong></> },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none", fontSize: 12 }}>
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
   PAGE: VALIDAR QR
───────────────────────────────────────────── */
function ValidarQR() {
  const [scanState, setScanState] = useState("idle"); // idle | valid | invalid
  const [cameraOn, setCameraOn] = useState(false);

  const resultColors = { idle: T.border, valid: "rgba(0,214,143,0.3)", invalid: "rgba(255,107,107,0.3)" };

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* DEMO TABS */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}`, background: T.card, borderRadius: "10px 10px 0 0", overflow: "hidden" }}>
          {[
            { key: "idle",    label: "En espera" },
            { key: "valid",   label: "✓ Garantía válida" },
            { key: "invalid", label: "✗ No encontrada" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setScanState(key)} style={{
              padding: "10px 18px", fontSize: 12, color: scanState === key ? T.green : T.muted,
              borderBottom: `2px solid ${scanState === key ? T.green : "transparent"}`,
              border: "none", background: "none", cursor: "pointer", fontFamily: "DM Sans", fontWeight: 500,
              transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "0 0 14px 14px", overflow: "hidden", flex: 1 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <i className="ti ti-qrcode" style={{ fontSize: 18, color: T.green }} />
            <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Validación de Garantía</span>
          </div>

          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* STEP 1: CAMERA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenSoft, border: `1px solid rgba(0,214,143,0.3)`, color: T.green, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
                Escanear Código QR
              </div>
              <div style={{
                background: "rgba(0,0,0,0.3)", border: `1px solid ${cameraOn ? "rgba(0,214,143,0.5)" : T.border}`,
                borderRadius: 10, aspectRatio: "4/3", display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 10, position: "relative", overflow: "hidden", cursor: "pointer",
                transition: "border-color 0.2s",
              }}>
                {/* scan line */}
                {cameraOn && (
                  <div style={{
                    position: "absolute", left: "10%", right: "10%", height: 2,
                    background: `linear-gradient(90deg, transparent, ${T.green}, transparent)`,
                    animation: "scanMove 2s ease-in-out infinite",
                  }} />
                )}
                {/* corners */}
                {[["tl","3px 0 0 3px","3px 0 0 3px"],["tr","3px 3px 0 0","0 3px 0 0"],
                  ["bl","0 0 3px 3px","0 0 0 3px"],["br","0 3px 3px 0","0 0 3px 0"]].map(([k, bw, br]) => (
                  <div key={k} style={{
                    position: "absolute", width: 18, height: 18,
                    borderColor: T.green, borderStyle: "solid", borderWidth: bw, borderRadius: br, opacity: 0.7,
                    ...(k==="tl"?{top:10,left:10}:k==="tr"?{top:10,right:10}:k==="bl"?{bottom:10,left:10}:{bottom:10,right:10}),
                  }} />
                ))}
                {!cameraOn && <i className="ti ti-camera" style={{ fontSize: 36, color: T.muted, opacity: 0.4 }} />}
                {!cameraOn && <span style={{ fontSize: 12, color: T.muted }}>Apunta la cámara al código QR</span>}
                {cameraOn && <span style={{ fontSize: 12, color: T.green }}>Escaneando...</span>}
                <button onClick={() => setCameraOn(c => !c)} style={{
                  marginTop: 4, padding: "8px 16px",
                  background: T.greenSoft, color: T.green,
                  border: `1px solid rgba(0,214,143,0.3)`, borderRadius: 7,
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <i className="ti ti-camera" style={{ fontSize: 14 }} />
                  {cameraOn ? "Detener Cámara" : "Activar Cámara"}
                </button>
              </div>
            </div>

            {/* STEP 2: RESULT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenSoft, border: `1px solid rgba(0,214,143,0.3)`, color: T.green, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
                Validar Detalles
              </div>
              <div style={{
                background: "rgba(0,0,0,0.2)", border: `1px solid ${resultColors[scanState]}`,
                borderRadius: 10, padding: 16, display: "flex", flexDirection: "column",
                gap: 10, flex: 1, minHeight: 200, transition: "border-color 0.3s",
              }}>
                {scanState === "idle" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <i className="ti ti-shield-search" style={{ fontSize: 32, color: T.muted, opacity: 0.3 }} />
                    <p style={{ fontSize: 12, color: T.muted, textAlign: "center", lineHeight: 1.5 }}>
                      Escanea un QR o ingresa un ID<br />para ver los detalles aquí
                    </p>
                  </div>
                )}

                {scanState === "valid" && (
                  <div className="gtx-fade" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                      <div>
                        <div style={{ fontSize: 12, color: T.muted }}>ID: <span style={{ color: T.green, fontWeight: 600 }}>#GTX-9904</span></div>
                        <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, color: T.green, letterSpacing: "0.04em" }}>✓ VÁLIDA</div>
                      </div>
                    </div>
                    {[
                      ["Cliente",       "Juan Gómez"],
                      ["Producto",      "Reparación TV Samsung"],
                      ["Fecha Inicio",  "10/Mar/2026"],
                      ["Vence",         "10/Sep/2026"],
                      ["Reclamaciones", "1 de ∞"],
                    ].map(([k, v], i, a) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 12.5 }}>
                        <span style={{ color: T.muted }}>{k}</span>
                        <span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button style={{ flex: 1, padding: 9, borderRadius: 7, border: `1px solid ${T.border}`, background: "none", color: T.text, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                        <i className="ti ti-eye" /> Ver Completo
                      </button>
                      <button style={{ flex: 1, padding: 9, borderRadius: 7, border: `1px solid rgba(255,180,0,0.2)`, background: "rgba(255,180,0,0.1)", color: T.yellow, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <i className="ti ti-alert-triangle" /> Reclamación
                      </button>
                    </div>
                  </div>
                )}

                {scanState === "invalid" && (
                  <div className="gtx-fade" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <i className="ti ti-shield-x" style={{ fontSize: 32, color: T.red }} />
                    <div style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 700, color: T.red }}>No Encontrada</div>
                    <p style={{ fontSize: 12, color: T.muted, textAlign: "center", lineHeight: 1.5 }}>
                      No existe ninguna garantía con ese<br />ID o código QR en el sistema.
                    </p>
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
            { icon: "ti-qrcode",    text: "Activa la cámara y apunta al QR del cliente para validar al instante" },
            { icon: "ti-keyboard",  text: "También puedes escribir el ID manualmente en el panel derecho" },
            { icon: "ti-alert-triangle", text: "Si la garantía es válida, podrás iniciar una reclamación desde aquí" },
          ].map(({ icon, text }, i, a) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 0", borderBottom: i < a.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 12 }}>
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
   PAGE: CLIENTES
───────────────────────────────────────────── */
function Clientes() {
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = CLIENTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
          {/* HEADER */}
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Directorio de Clientes</span>
              <span style={{ background: T.greenSoft, color: T.green, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, border: `1px solid rgba(0,214,143,0.2)` }}>
                {filtered.length} clientes
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: T.muted, pointerEvents: "none" }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cliente..."
                style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 12px 7px 32px", fontSize: 12.5, color: T.text, outline: "none", width: 200 }}
              />
            </div>
          </div>

          {/* TABLE */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d1b30", position: "sticky", top: 0, zIndex: 1 }}>
                  {["ID Cliente", "Nombre", "Email", "Teléfono", "Garantías", "Última Actividad", "Estado", ""].map(h => (
                    <th key={h} style={{ padding: "10px 16px", fontSize: 11, color: T.muted, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, idx) => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: "11px 16px", fontFamily: "Syne", fontSize: 12, color: T.green, fontWeight: 600 }}>{c.id}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, whiteSpace: "nowrap" }}>{c.name}</td>
                    <td style={{ padding: "11px 16px", fontSize: 12.5, color: T.muted }}>{c.email}</td>
                    <td style={{ padding: "11px 16px", fontSize: 12.5, color: T.muted, whiteSpace: "nowrap" }}>{c.phone}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, textAlign: "center" }}>{c.warranties}</td>
                    <td style={{ padding: "11px 16px", fontSize: 12.5, color: T.muted, whiteSpace: "nowrap" }}>{c.lastActivity}</td>
                    <td style={{ padding: "11px 16px" }}><Badge status={c.status} /></td>
                    <td style={{ padding: "11px 16px", textAlign: "right", position: "relative" }}>
                      <button
                        onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                        style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", color: T.muted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}
                      >⋯</button>
                      {openMenu === idx && (
                        <div style={{
                          position: "absolute", right: 0, top: "calc(100% - 4px)",
                          background: "#162340", border: `1px solid ${T.border}`,
                          borderRadius: 8, padding: 4, zIndex: 10, minWidth: 170,
                          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        }}>
                          {[
                            { icon: "ti-shield-check", label: "Ver Garantías" },
                            { icon: "ti-edit",          label: "Editar Información" },
                            { icon: "ti-plus",          label: "Nueva Reclamación" },
                          ].map(({ icon, label }) => (
                            <button key={label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: T.text, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}>
                              <i className={`ti ${icon}`} style={{ fontSize: 15, color: T.muted }} /> {label}
                            </button>
                          ))}
                          <div style={{ borderTop: `1px solid ${T.border}`, margin: "3px 0" }} />
                          <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: T.red, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}>
                            <i className="ti ti-trash" style={{ fontSize: 15, color: T.red }} /> Eliminar Cliente
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <QRPanel />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Resumen de Clientes</div>
          {[
            { label: "Total registrados",  val: CLIENTS.length,                                           color: T.text  },
            { label: "Clientes activos",   val: CLIENTS.filter(c => c.status === "ACTIVO").length,        color: T.green },
            { label: "Clientes inactivos", val: CLIENTS.filter(c => c.status === "INACTIVO").length,      color: T.yellow },
            { label: "Con reclamaciones",  val: "2",                                                      color: T.text  },
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
   PAGE: CONFIGURACIÓN (placeholder)
───────────────────────────────────────────── */
function Configuracion() {
  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <i className="ti ti-settings" style={{ fontSize: 48, color: T.muted, opacity: 0.3 }} />
        <div style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 600, color: T.muted }}>Configuración</div>
        <p style={{ fontSize: 13, color: T.muted, opacity: 0.7 }}>Esta sección estará disponible próximamente.</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("dashboard");

  const pageTitles = {
    dashboard: "Taller de Electrónica Pérez",
    nueva:     "Taller de Electrónica Pérez",
    validar:   "Taller de Electrónica Pérez",
    clientes:  "Taller de Electrónica Pérez",
    config:    "Taller de Electrónica Pérez",
  };

  const pageActions = {
    dashboard: (
      <button onClick={() => setPage("nueva")} style={{
        display: "flex", alignItems: "center", gap: 7,
        background: T.green, color: T.navy, border: "none",
        borderRadius: 8, padding: "9px 18px", fontSize: 13,
        fontWeight: 600, cursor: "pointer",
      }}>
        <i className="ti ti-plus" style={{ fontSize: 14 }} /> Crear Nueva Garantía
      </button>
    ),
    clientes: (
      <button onClick={() => setPage("nueva")} style={{
        display: "flex", alignItems: "center", gap: 7,
        background: T.green, color: T.navy, border: "none",
        borderRadius: 8, padding: "9px 18px", fontSize: 13,
        fontWeight: 600, cursor: "pointer",
      }}>
        <i className="ti ti-plus" style={{ fontSize: 14 }} /> Crear Nueva Garantía
      </button>
    ),
  };

  const pages = { dashboard: Dashboard, nueva: NuevaGarantia, validar: ValidarQR, clientes: Clientes, config: Configuracion };
  const PageComponent = pages[page];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar active={page} setPage={setPage} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <TopBar title={pageTitles[page]} action={pageActions[page]} />
          <PageComponent setPage={setPage} />
        </div>
      </div>
    </>
  );
}
