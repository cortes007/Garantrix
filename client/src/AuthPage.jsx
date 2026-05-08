import { useState } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS (mismo sistema que el dashboard)
───────────────────────────────────────────── */
const T = {
  navy:      "#0B1628",
  navy2:     "#0F1E38",
  navy3:     "#162340",
  green:     "#00D68F",
  greenDim:  "#00b87a",
  greenSoft: "rgba(0,214,143,0.12)",
  text:      "#E8EDF5",
  muted:     "#7A8FA8",
  border:    "rgba(255,255,255,0.07)",
  card:      "rgba(255,255,255,0.04)",
  red:       "#FF6B6B",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${T.navy};
    color: ${T.text};
    min-height: 100vh;
    overflow: hidden;
  }

  input, button { font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(2deg); }
  }

  @keyframes pulse-ring {
    0%   { transform: scale(0.9); opacity: 0.6; }
    100% { transform: scale(1.4); opacity: 0; }
  }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  .gtx-card-fade {
    animation: fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
  }

  .gtx-input:focus {
    border-color: rgba(0,214,143,0.5) !important;
    box-shadow: 0 0 0 3px rgba(0,214,143,0.08);
  }

  .gtx-btn-primary:hover {
    background: ${T.greenDim} !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0,214,143,0.25);
  }

  .gtx-btn-primary:active { transform: translateY(0); }

  .gtx-tab:hover { color: ${T.text} !important; }

  .gtx-link:hover { color: ${T.green} !important; }
`;

/* ─────────────────────────────────────────────
   BACKGROUND DECORATION
───────────────────────────────────────────── */
function BgDecor() {
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* gradient orbs */}
      <div style={{
        position: "absolute", top: "-10%", right: "-5%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,214,143,0.06) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", left: "-10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(26,127,221,0.07) 0%, transparent 70%)",
      }} />

      {/* subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* floating shield icon */}
      <div style={{
        position: "absolute", right: "8%", top: "20%",
        animation: "float 6s ease-in-out infinite",
        opacity: 0.06,
      }}>
        <svg width="180" height="180" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
            fill={T.green} />
          <path d="M9 12L11 14L15 10" stroke="#0B1628" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* decorative dots */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${10 + i * 15}%`,
          top: `${75 + (i % 2) * 10}%`,
          width: 4, height: 4, borderRadius: "50%",
          background: T.green, opacity: 0.08 + i * 0.015,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOGO MARK
───────────────────────────────────────────── */
function LogoMark() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 32 }}>
      <div style={{ position: "relative" }}>
        {/* pulse ring */}
        <div style={{
          position: "absolute", inset: -8,
          borderRadius: "50%",
          border: `1px solid rgba(0,214,143,0.3)`,
          animation: "pulse-ring 2.5s ease-out infinite",
        }} />
        <div style={{
          width: 56, height: 56,
          background: T.greenSoft,
          border: `1.5px solid rgba(0,214,143,0.35)`,
          borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
              stroke={T.green} strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M9 12L11 14L15 10" stroke={T.green} strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "Syne", fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em" }}>
          Garan<span style={{ color: T.green }}>tix</span>
        </div>
        <div style={{ fontSize: 12, color: T.muted, marginTop: 2, letterSpacing: "0.04em" }}>
          Gestión inteligente de garantías
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INPUT FIELD
───────────────────────────────────────────── */
function Field({ label, icon, type = "text", placeholder, value, onChange, error }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: T.muted, fontWeight: 500, letterSpacing: "0.02em" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <i className={`ti ${icon}`} style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          fontSize: 16, color: error ? T.red : T.muted, pointerEvents: "none",
        }} />
        <input
          className="gtx-input"
          type={isPassword && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: "100%", background: "rgba(0,0,0,0.2)",
            border: `1px solid ${error ? "rgba(255,107,107,0.4)" : T.border}`,
            borderRadius: 8, padding: "11px 12px 11px 38px",
            fontSize: 13.5, color: T.text, outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            paddingRight: isPassword ? 40 : 12,
          }}
        />
        {isPassword && (
          <button onClick={() => setShow(s => !s)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            color: T.muted, fontSize: 16, padding: 0, display: "flex",
          }}>
            <i className={`ti ${show ? "ti-eye-off" : "ti-eye"}`} />
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: 11.5, color: T.red }}>{error}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOGIN FORM
───────────────────────────────────────────── */
function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "El email es requerido";
    if (!form.password) e.password = "La contraseña es requerida";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
      onSuccess(data.user);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {serverError && (
        <div style={{
          background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)",
          borderRadius: 8, padding: "10px 14px", fontSize: 13, color: T.red,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className="ti ti-alert-circle" style={{ fontSize: 16 }} />
          {serverError}
        </div>
      )}

      <Field label="Email" icon="ti-mail" type="email" placeholder="correo@negocio.com"
        value={form.email} onChange={set("email")} error={errors.email} />
      <Field label="Contraseña" icon="ti-lock" type="password" placeholder="Tu contraseña"
        value={form.password} onChange={set("password")} error={errors.password} />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="gtx-link" style={{
          background: "none", border: "none", fontSize: 12,
          color: T.muted, cursor: "pointer", transition: "color 0.15s",
        }}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button
        className="gtx-btn-primary"
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%", background: T.green, color: T.navy,
          border: "none", borderRadius: 8, padding: "12px",
          fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.02em", transition: "all 0.2s",
          opacity: loading ? 0.7 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {loading
          ? <><i className="ti ti-loader-2" style={{ fontSize: 16, animation: "spin 1s linear infinite" }} /> Iniciando sesión...</>
          : <><i className="ti ti-login" style={{ fontSize: 16 }} /> Iniciar Sesión</>
        }
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REGISTER FORM
───────────────────────────────────────────── */
function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ businessName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.businessName)    e.businessName    = "El nombre del negocio es requerido";
    if (!form.email)           e.email           = "El email es requerido";
    if (!form.phone)           e.phone           = "El teléfono es requerido";
    if (!form.password)        e.password        = "La contraseña es requerida";
    else if (form.password.length < 8) e.password = "Mínimo 8 caracteres";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Las contraseñas no coinciden";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          businessName: form.businessName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrar");
      onSuccess(data.user);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {serverError && (
        <div style={{
          background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)",
          borderRadius: 8, padding: "10px 14px", fontSize: 13, color: T.red,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className="ti ti-alert-circle" style={{ fontSize: 16 }} />
          {serverError}
        </div>
      )}

      <Field label="Nombre del Negocio" icon="ti-building-store" placeholder="Ej. Taller de Electrónica Pérez"
        value={form.businessName} onChange={set("businessName")} error={errors.businessName} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Email" icon="ti-mail" type="email" placeholder="correo@negocio.com"
          value={form.email} onChange={set("email")} error={errors.email} />
        <Field label="Teléfono" icon="ti-phone" placeholder="+57 300 000 0000"
          value={form.phone} onChange={set("phone")} error={errors.phone} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Contraseña" icon="ti-lock" type="password" placeholder="Mín. 8 caracteres"
          value={form.password} onChange={set("password")} error={errors.password} />
        <Field label="Confirmar Contraseña" icon="ti-lock-check" type="password" placeholder="Repite tu contraseña"
          value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
      </div>

      {/* password strength */}
      {form.password && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[1,2,3,4].map(i => {
              const strength = form.password.length >= 12 ? 4 : form.password.length >= 10 ? 3 : form.password.length >= 8 ? 2 : 1;
              return (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i <= strength
                    ? strength === 1 ? T.red : strength === 2 ? "#FFC947" : strength === 3 ? "#7EE8A2" : T.green
                    : T.border,
                  transition: "background 0.3s",
                }} />
              );
            })}
          </div>
          <span style={{ fontSize: 11, color: T.muted }}>
            {form.password.length < 8 ? "Muy corta" : form.password.length < 10 ? "Débil" : form.password.length < 12 ? "Buena" : "Fuerte"}
          </span>
        </div>
      )}

      <button
        className="gtx-btn-primary"
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%", background: T.green, color: T.navy,
          border: "none", borderRadius: 8, padding: "12px",
          fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.02em", transition: "all 0.2s",
          opacity: loading ? 0.7 : 1, marginTop: 4,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {loading
          ? <><i className="ti ti-loader-2" style={{ fontSize: 16 }} /> Registrando...</>
          : <><i className="ti ti-shield-plus" style={{ fontSize: 16 }} /> Crear Cuenta</>
        }
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AUTH PAGE (exported)
───────────────────────────────────────────── */
export default function AuthPage({ onAuthenticated }) {
  const [tab, setTab] = useState("login"); // "login" | "register"

  const handleSuccess = (user) => {
    // user = { _id, businessName, email, ... }
    onAuthenticated(user);
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <BgDecor />

      <div style={{
        position: "relative", zIndex: 1,
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <div className="gtx-card-fade" style={{
          width: "100%", maxWidth: tab === "register" ? 520 : 420,
          background: T.navy2,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: 36,
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          transition: "max-width 0.3s ease",
        }}>
          <LogoMark />

          {/* TABS */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "rgba(0,0,0,0.2)", borderRadius: 10,
            padding: 4, marginBottom: 28,
          }}>
            {[
              { key: "login",    label: "Iniciar Sesión" },
              { key: "register", label: "Registrarse" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className="gtx-tab"
                onClick={() => setTab(key)}
                style={{
                  padding: "9px 0", borderRadius: 8,
                  border: "none", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s",
                  background: tab === key ? T.navy3 : "none",
                  color: tab === key ? T.text : T.muted,
                  boxShadow: tab === key ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                }}
              >{label}</button>
            ))}
          </div>

          {/* FORM TITLE */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "Syne", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {tab === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
            </div>
            <div style={{ fontSize: 13, color: T.muted }}>
              {tab === "login"
                ? "Ingresa tus credenciales para acceder al panel"
                : "Regístrate para gestionar tus garantías"}
            </div>
          </div>

          {/* FORMS */}
          {tab === "login"
            ? <LoginForm onSuccess={handleSuccess} />
            : <RegisterForm onSuccess={handleSuccess} />
          }

          {/* FOOTER */}
          <div style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: T.muted }}>
            Garantix by DEVRA · Unisabaneta 2026
          </div>
        </div>
      </div>
    </>
  );
}
