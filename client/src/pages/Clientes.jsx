// pages/Clientes.jsx
import { useState, useEffect, useCallback } from "react";
import { T } from "../styles/tokens.js";
import { apiFetch, fmt } from "../scripts/api.js";
import { Spinner, Badge, EmptyState, Feedback, QRPanel } from "../components/ui.jsx";

export default function Clientes({ setPage, verGarantia }) {
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [msg,      setMsg]      = useState(null);

  // Modal de reclamación
  const [claimModal,   setClaimModal]   = useState(null); // { clientId, warranties[] }
  const [claimWarranty, setClaimWarranty] = useState("");
  const [claimDesc,    setClaimDesc]    = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimMsg,     setClaimMsg]     = useState(null);

  // Modal de selección de garantía para ver
  const [viewModal,    setViewModal]    = useState(null); // { client, warranties[] }
  const [viewSelected, setViewSelected] = useState("");

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
      setDeleting(null);
      setOpenMenu(null);
    }
  };

  // Abrir modal de reclamar garantía
  const handleOpenClaim = async (client) => {
    setOpenMenu(null);
    setClaimMsg(null);
    setClaimDesc("");
    setClaimWarranty("");
    try {
      const data = await apiFetch(`/api/warranties?clientId=${client._id}`);
      const activas = (data.warranties || []).filter(w => w.status === "ACTIVA");
      if (activas.length === 0) {
        setMsg({ type: "err", text: `${client.name} no tiene garantías activas para reclamar` });
        return;
      }
      setClaimModal({ client, warranties: activas });
      setClaimWarranty(activas[0]._id);
    } catch {
      setMsg({ type: "err", text: "Error al cargar garantías del cliente" });
    }
  };

  const handleSubmitClaim = async () => {
    if (!claimWarranty || !claimDesc.trim()) {
      setClaimMsg({ type: "err", text: "Selecciona una garantía y describe el problema" });
      return;
    }
    setClaimLoading(true);
    try {
      await apiFetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warrantyId: claimWarranty, description: claimDesc.trim() }),
      });
      setClaimMsg({ type: "ok", text: "¡Reclamación registrada exitosamente!" });
      setTimeout(() => {
        setClaimModal(null);
        setMsg({ type: "ok", text: "Reclamación creada. Puedes verla en Garantías Reclamadas." });
      }, 1500);
    } catch (err) {
      setClaimMsg({ type: "err", text: err.message || "Error al crear reclamación" });
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <>
      {/* MODAL SELECCIONAR GARANTÍA PARA VER */}
      {viewModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setViewModal(null)}>
          <div
            className="gtx-fade"
            onClick={e => e.stopPropagation()}
            style={{
              background: "#0f1e38", border: `1px solid ${T.border}`,
              borderRadius: 16, padding: 28, width: 420, maxWidth: "90vw",
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 700 }}>Ver Garantía</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                  Cliente: <span style={{ color: T.text }}>{viewModal.client.name}</span>
                  {" · "}
                  <span style={{ color: T.green }}>{viewModal.warranties.length} garantías</span>
                </div>
              </div>
              <button onClick={() => setViewModal(null)} style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            {/* Selector */}
            <div>
              <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Selecciona la garantía
              </label>
              <select
                value={viewSelected}
                onChange={e => setViewSelected(e.target.value)}
                style={{
                  width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.text,
                  outline: "none", cursor: "pointer",
                }}
              >
                {viewModal.warranties.map(w => (
                  <option key={w._id} value={w._id} style={{ background: "#0f1e38" }}>
                    {w.warrantyCode} — {w.product}
                    {w.status === "ACTIVA" ? " ✓" : w.status === "RECLAMADA" ? " ⚠" : " ✕"}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview rápido de la garantía seleccionada */}
            {(() => {
              const sel = viewModal.warranties.find(w => w._id === viewSelected);
              if (!sel) return null;
              return (
                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: 12, display: "flex", flexDirection: "column", gap: 5 }}>
                  {[
                    { label: "Código",     val: sel.warrantyCode },
                    { label: "Producto",   val: sel.product },
                    { label: "Estado",     val: sel.status },
                    { label: "Registrada", val: sel.createdAt ? fmt(sel.createdAt) : "—" },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: T.muted }}>{label}</span>
                      <span style={{ color: T.text, fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Botones */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setViewModal(null)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 13, border: `1px solid ${T.border}`, background: "none", color: T.muted, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const sel = viewModal.warranties.find(w => w._id === viewSelected);
                  if (sel) { verGarantia(sel.warrantyCode); setViewModal(null); }
                }}
                style={{
                  flex: 2, padding: "10px 0", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  background: "#1e6fdc", color: "#fff", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <i className="ti ti-eye" style={{ fontSize: 15 }} />
                Ver Garantía Completa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECLAMAR GARANTÍA */}
      {claimModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setClaimModal(null)}>
          <div
            className="gtx-fade"
            onClick={e => e.stopPropagation()}
            style={{
              background: "#0f1e38", border: `1px solid ${T.border}`,
              borderRadius: 16, padding: 28, width: 440, maxWidth: "90vw",
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "Syne", fontSize: 16, fontWeight: 700 }}>Reclamar Garantía</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                  Cliente: <span style={{ color: T.text }}>{claimModal.client.name}</span>
                </div>
              </div>
              <button onClick={() => setClaimModal(null)} style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            {claimMsg && <Feedback msg={claimMsg} />}

            {/* Seleccionar garantía */}
            <div>
              <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Garantía a reclamar
              </label>
              <select
                value={claimWarranty}
                onChange={e => setClaimWarranty(e.target.value)}
                style={{
                  width: "100%", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: "9px 12px", fontSize: 13, color: T.text,
                  outline: "none", cursor: "pointer",
                }}
              >
                {claimModal.warranties.map(w => (
                  <option key={w._id} value={w._id} style={{ background: "#0f1e38" }}>
                    {w.warrantyCode} — {w.product}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción del problema */}
            <div>
              <label style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                Descripción del problema
              </label>
              <textarea
                value={claimDesc}
                onChange={e => setClaimDesc(e.target.value)}
                placeholder="Describe el problema o defecto de la garantía..."
                rows={4}
                style={{
                  width: "100%", background: "rgba(0,0,0,0.25)", border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: "10px 12px", fontSize: 13, color: T.text,
                  outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.5,
                }}
              />
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setClaimModal(null)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 13,
                  border: `1px solid ${T.border}`, background: "none", color: T.muted, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={claimLoading}
                style={{
                  flex: 2, padding: "10px 0", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  background: T.yellow, color: "#000", border: "none",
                  cursor: claimLoading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  opacity: claimLoading ? 0.7 : 1,
                }}
              >
                {claimLoading
                  ? <Spinner size={14} />
                  : <i className="ti ti-alert-triangle" style={{ fontSize: 15 }} />
                }
                Registrar Reclamación
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {msg && <div style={{ marginBottom: 10 }}><Feedback msg={msg} /></div>}

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
            {/* HEADER */}
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Directorio de Clientes</span>
                <span style={{ background: T.greenSoft, color: T.green, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, border: `1px solid rgba(0,214,143,0.2)` }}>
                  {clients.length} clientes
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: T.muted, pointerEvents: "none" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar cliente..."
                  style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 7, padding: "7px 12px 7px 32px", fontSize: 12.5, color: T.text, outline: "none", width: 200 }}
                />
              </div>
            </div>

            {/* TABLA */}
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
                          <button
                            onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                            style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", color: T.muted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}
                          >⋯</button>
                          {openMenu === idx && (
                            <div style={{ position: "absolute", right: 0, top: "calc(100% - 4px)", background: "#162340", border: `1px solid ${T.border}`, borderRadius: 8, padding: 4, zIndex: 10, minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                              <button onClick={() => { setPage("nueva"); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: T.text, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}>
                                <i className="ti ti-shield-plus" style={{ fontSize: 15, color: T.muted }} /> Nueva Garantía
                              </button>
                              <button
                                onClick={async () => {
                                  setOpenMenu(null);
                                  try {
                                    const data = await apiFetch(`/api/warranties?clientId=${c._id}`);
                                    const todas = data.warranties || [];
                                    if (todas.length === 0) {
                                      setMsg({ type: "err", text: "Este cliente no tiene garantías registradas" });
                                    } else if (todas.length === 1) {
                                      verGarantia(todas[0].warrantyCode);
                                    } else {
                                      setViewModal({ client: c, warranties: todas });
                                      setViewSelected(todas[0]._id);
                                    }
                                  } catch {
                                    setMsg({ type: "err", text: "Error al buscar garantías" });
                                  }
                                }}
                                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: T.text, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}
                              >
                                <i className="ti ti-eye" style={{ fontSize: 15, color: T.muted }} />
                                Ver Garantía Completa
                              </button>

                              {/* ── NUEVA OPCIÓN: RECLAMAR GARANTÍA ── */}
                              <button
                                onClick={() => handleOpenClaim(c)}
                                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: T.yellow, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}
                              >
                                <i className="ti ti-alert-triangle" style={{ fontSize: 15, color: T.yellow }} />
                                Reclamar Garantía
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

        {/* PANEL DERECHO */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <QRPanel />
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Resumen de Clientes</div>
            {[
              { label: "Total registrados",  val: clients.length,                        color: T.text   },
              { label: "Clientes activos",   val: clients.filter(c => c.active).length,  color: T.green  },
              
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12.5 }}>
                <span style={{ color: T.muted }}>{label}</span>
                <span style={{ color, fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}