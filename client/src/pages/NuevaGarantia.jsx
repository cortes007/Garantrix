// pages/NuevaGarantia.jsx
import { useState } from "react";
import { T, fieldStyle, labelStyle } from "../styles/tokens.js";
import { apiFetch, calcWarrantyDates } from "../scripts/api.js";
import { Spinner, Feedback, QRPanel } from "../components/ui.jsx";

export default function NuevaGarantia({ setPage }) {
  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "",
    product: "", invoiceNumber: "", purchaseDate: "",
    duration: "6", durationFrom: "today",
  });
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);
  const [created, setCreated] = useState(null);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    const { clientName, clientEmail, product, purchaseDate } = form;
    if (!clientName || !clientEmail || !product || !purchaseDate) {
      setMsg({ type: "err", text: "Nombre, email, producto y fecha de compra son obligatorios" });
      return;
    }
    setSaving(true); setMsg(null);
    try {
      // 1. Buscar o crear cliente
      let clientId;
      try {
        const clientsData = await apiFetch(`/api/clients?search=${encodeURIComponent(clientEmail)}`);
        const existing = clientsData.clients?.find(c => c.email.toLowerCase() === clientEmail.toLowerCase());
        clientId = existing
          ? existing._id
          : (await apiFetch("/api/clients", { method: "POST", body: JSON.stringify({ name: clientName, email: clientEmail, phone: form.clientPhone }) })).client._id;
      } catch {
        clientId = (await apiFetch("/api/clients", { method: "POST", body: JSON.stringify({ name: clientName, email: clientEmail, phone: form.clientPhone }) })).client._id;
      }

      // 2. Crear garantía
      const { startDate, endDate } = calcWarrantyDates(form.durationFrom, form.purchaseDate, form.duration);
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

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "auto" }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <i className="ti ti-shield-plus" style={{ fontSize: 18, color: T.green }} />
          <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Registrar Nueva Garantía</span>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
          {/* DATOS DEL CLIENTE */}
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

          {/* DETALLES DEL PRODUCTO */}
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

          {/* GARANTÍA CREADA */}
          {created && (
            <div className="gtx-fade" style={{ background: "rgba(0,214,143,0.06)", border: "1px solid rgba(0,214,143,0.2)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: "Syne", fontSize: 13, fontWeight: 600, color: T.green }}>🎉 Garantía generada</div>
              <div style={{ fontSize: 12, color: T.muted }}>
                <strong style={{ color: T.text }}>Código:</strong> {created.warrantyCode}<br />
                <strong style={{ color: T.text }}>Cliente:</strong> {created.clientId?.name} ({created.clientId?.email})<br />
                <strong style={{ color: T.text }}>Producto:</strong> {created.product}<br />
                <strong style={{ color: T.text }}>Válida desde:</strong> {new Date(created.startDate).toLocaleDateString()} hasta {new Date(created.endDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setPage("dashboard")} style={{ padding: "9px 20px", borderRadius: 7, border: `1px solid ${T.border}`, background: "none", color: T.muted, cursor: "pointer", fontSize: 13 }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 7, background: T.green, color: T.navy, border: "none", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? <Spinner size={14} /> : <i className="ti ti-qrcode" style={{ fontSize: 16 }} />}
            {saving ? "Guardando..." : "Generar Garantía y QR"}
          </button>
        </div>
      </div>

      {/* PANEL DERECHO */}
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
