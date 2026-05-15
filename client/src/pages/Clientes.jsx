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

  return (
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
                          <div style={{ position: "absolute", right: 0, top: "calc(100% - 4px)", background: "#162340", border: `1px solid ${T.border}`, borderRadius: 8, padding: 4, zIndex: 10, minWidth: 170, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                            <button onClick={() => { setPage("nueva"); setOpenMenu(null); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: T.text, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}>
                              <i className="ti ti-shield-plus" style={{ fontSize: 15, color: T.muted }} /> Nueva Garantía
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const data = await apiFetch(`/api/warranties?clientId=${c._id}`);
                                  const ultima = data.warranties?.[0];
                                  if (ultima) {
                                    verGarantia(ultima.warrantyCode);
                                  } else {
                                    alert("Este cliente no tiene garantías registradas");
                                  }
                                } catch {
                                  alert("Error al buscar garantías");
                                }
                              }}
                              style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, fontSize: 13, color: T.text, cursor: "pointer", border: "none", background: "none", width: "100%", textAlign: "left" }}
                            >
                              <i className="ti ti-eye" style={{ fontSize: 15, color: T.muted }} />
                              Ver Garantía Completa
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
            { label: "Total registrados",  val: clients.length,                       color: T.text   },
            { label: "Clientes activos",   val: clients.filter(c => c.active).length, color: T.green  },
            { label: "Clientes inactivos", val: clients.filter(c => !c.active).length, color: T.yellow },
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
