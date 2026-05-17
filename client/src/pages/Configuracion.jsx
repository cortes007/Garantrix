// pages/Configuracion.jsx
import { useState, useEffect } from "react";
import { T, cfgInputStyle, cfgLabelStyle } from "../styles/tokens.js";
import { apiFetch, API } from "../scripts/api.js";
import { Spinner, Feedback, SectionCard, PwInput } from "../components/ui.jsx";

export default function Configuracion({ user, onLogout }) {
  const [bizForm,        setBizForm]        = useState({ businessName: user?.businessName || "", email: user?.email || "", phone: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [bizSaving,      setBizSaving]      = useState(false);
  const [bizMsg,         setBizMsg]         = useState(null);

  const [pwForm,      setPwForm]      = useState({ current: "", next: "", confirm: "" });
  const [pwSaving,    setPwSaving]    = useState(false);
  const [pwMsg,       setPwMsg]       = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext,    setShowNext]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);

  // Cargar datos frescos de la BD (el JWT no guarda phone)
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
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwMsg({ type: "err", text: "Completa todos los campos" }); return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: "err", text: "Las contraseñas nuevas no coinciden" }); return;
    }
    if (pwForm.next.length < 8) {
      setPwMsg({ type: "err", text: "Mínimo 8 caracteres" }); return;
    }
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

  const strengthLevel = pwForm.next.length >= 12 ? 4 : pwForm.next.length >= 10 ? 3 : pwForm.next.length >= 8 ? 2 : 1;
  const strengthLabel = pwForm.next.length < 8 ? "Muy corta" : pwForm.next.length < 10 ? "Débil" : pwForm.next.length < 12 ? "Buena" : "Fuerte";
  const strengthColor = strengthLevel === 1 ? T.red : strengthLevel === 2 ? T.yellow : strengthLevel === 3 ? "#7EE8A2" : T.green;

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40 }}>
      {loadingProfile ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <Spinner size={32} />
        </div>
      ) : (<>

        {/* DATOS DEL NEGOCIO */}
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

        {/* CAMBIAR CONTRASEÑA */}
        <SectionCard icon="ti-lock" title="Cambiar Contraseña">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <PwInput label="Contraseña actual"        value={pwForm.current} onChange={setPw("current")} show={showCurrent} onToggleShow={() => setShowCurrent(s => !s)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <PwInput label="Nueva contraseña"        value={pwForm.next}    onChange={setPw("next")}    show={showNext}    onToggleShow={() => setShowNext(s => !s)} />
              <PwInput label="Confirmar nueva contraseña" value={pwForm.confirm} onChange={setPw("confirm")} show={showConfirm} onToggleShow={() => setShowConfirm(s => !s)} />
            </div>
            {pwForm.next && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strengthLevel ? strengthColor : T.border, transition: "background 0.3s" }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: T.muted }}>{strengthLabel}</span>
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

        {/* CERRAR SESIÓN */}
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
