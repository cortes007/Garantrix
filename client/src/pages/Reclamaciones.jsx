// pages/Reclamaciones.jsx
import { useState, useEffect, useCallback } from "react";
import { T } from "../styles/tokens.js";
import { apiFetch, fmt } from "../scripts/api.js";
import { Spinner, Badge, EmptyState, Feedback } from "../components/ui.jsx";

const STATUS_OPTS = ["PENDIENTE", "EN_PROCESO", "RESUELTA"];

export default function Reclamaciones() {
  const [claims,    setClaims]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [selected,  setSelected]  = useState(null); // claim abierto en detalle
  const [updating,  setUpdating]  = useState(false);
  const [notes,     setNotes]     = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [msg,       setMsg]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const data = await apiFetch(`/api/claims${params}`);
      setClaims(data.claims || []);
    } catch {
      setMsg({ type: "err", text: "Error al cargar reclamaciones" });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openDetail = (claim) => {
    setSelected(claim);
    setNotes(claim.notes || "");
    setNewStatus(claim.status);
    setMsg(null);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const data = await apiFetch(`/api/claims/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      setMsg({ type: "ok", text: "Reclamación actualizada correctamente" });
      setClaims(prev => prev.map(c => c._id === selected._id ? { ...c, status: newStatus, notes } : c));
      setSelected(prev => ({ ...prev, status: newStatus, notes }));
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Error al actualizar" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta reclamación?")) return;
    try {
      await apiFetch(`/api/claims/${id}`, { method: "DELETE" });
      setClaims(prev => prev.filter(c => c._id !== id));
      if (selected?._id === id) setSelected(null);
      setMsg({ type: "ok", text: "Reclamación eliminada" });
    } catch {
      setMsg({ type: "err", text: "Error al eliminar reclamación" });
    }
  };

  const statusColor = (s) => ({
    PENDIENTE:  T.yellow,
    EN_PROCESO: T.blue,
    RESUELTA:   T.green,
  }[s] || T.muted);

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap: 20, flex: 1, overflow: "hidden" }}>

      {/* COLUMNA PRINCIPAL */}
      <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {msg && !selected && <div style={{ marginBottom: 10 }}><Feedback msg={msg} /></div>}

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>

          {/* HEADER */}
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Garantías Reclamadas</span>
              <span style={{ background: "rgba(255,180,0,0.12)", color: T.yellow, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, border: "1px solid rgba(255,180,0,0.2)" }}>
                {claims.length} reclamación{claims.length !== 1 ? "es" : ""}
              </span>
            </div>
            {/* FILTROS */}
            <div style={{ display: "flex", gap: 6 }}>
              {[["all", "Todas"], ["PENDIENTE", "Pendientes"], ["EN_PROCESO", "En proceso"], ["RESUELTA", "Resueltas"]].map(([val, lbl]) => (
                <button key={val} onClick={() => setFilter(val)} style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: `1px solid ${filter === val ? T.yellow : T.border}`,
                  background: filter === val ? "rgba(255,180,0,0.1)" : "none",
                  color: filter === val ? T.yellow : T.muted, cursor: "pointer",
                }}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* TABLA */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: 40, display: "flex", justifyContent: "center" }}><Spinner size={28} /></div>
            ) : claims.length === 0 ? (
              <EmptyState icon="ti-clipboard-x" title="Sin reclamaciones" sub={filter !== "all" ? "No hay reclamaciones con este estado" : "Las reclamaciones aparecen al reclamar una garantía"} />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: "#0d1b30", position: "sticky", top: 0, zIndex: 1 }}>
                    {["Garantía", "Cliente", "Producto", "Descripción", "Fecha", "Estado", ""].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 11, color: T.muted, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claims.map(cl => (
                    <tr
                      key={cl._id}
                      className="gtx-row"
                      style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer", background: selected?._id === cl._id ? "rgba(255,180,0,0.04)" : "transparent" }}
                      onClick={() => openDetail(cl)}
                    >
                      <td style={{ padding: "11px 16px", fontFamily: "Syne", fontSize: 12, color: T.green, fontWeight: 600, whiteSpace: "nowrap" }}>
                        {cl.warrantyId?.warrantyCode || "-"}
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>
                        {cl.warrantyId?.clientId?.name || "-"}
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 12.5, color: T.muted }}>
                        {cl.warrantyId?.product || "-"}
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 12.5, color: T.muted, maxWidth: 200 }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {cl.description}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 12.5, color: T.muted, whiteSpace: "nowrap" }}>{fmt(cl.createdAt)}</td>
                      <td style={{ padding: "11px 16px" }}><Badge status={cl.status} /></td>
                      <td style={{ padding: "11px 16px", textAlign: "right" }}>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(cl._id); }}
                          style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 8px", color: T.red, cursor: "pointer", fontSize: 13 }}
                        >
                          <i className="ti ti-trash" style={{ fontSize: 13 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* PANEL DETALLE */}
      {selected && (
        <div className="gtx-fade" style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontFamily: "Syne", fontSize: 14, fontWeight: 600 }}>Detalle de Reclamación</span>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>

          <div style={{ padding: "16px 18px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {msg && <Feedback msg={msg} />}

            {/* INFO */}
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Garantía",  val: selected.warrantyId?.warrantyCode, color: T.green },
                { label: "Cliente",   val: selected.warrantyId?.clientId?.name },
                { label: "Email",     val: selected.warrantyId?.clientId?.email },
                { label: "Producto",  val: selected.warrantyId?.product },
                { label: "Registrada", val: fmt(selected.createdAt) },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <span style={{ color: T.muted }}>{label}</span>
                  <span style={{ color: color || T.text, fontWeight: 500, textAlign: "right", maxWidth: 180 }}>{val || "-"}</span>
                </div>
              ))}
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Descripción del problema</div>
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 1.6, color: T.text }}>
                {selected.description}
              </div>
            </div>

            {/* CAMBIAR ESTADO */}
            <div>
              <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Estado actual</div>
              <div style={{ display: "flex", gap: 6 }}>
                {STATUS_OPTS.map(s => (
                  <button key={s} onClick={() => setNewStatus(s)} style={{
                    flex: 1, padding: "7px 4px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                    border: `1px solid ${newStatus === s ? statusColor(s) : T.border}`,
                    background: newStatus === s ? `${statusColor(s)}1a` : "none",
                    color: newStatus === s ? statusColor(s) : T.muted, cursor: "pointer",
                  }}>{s.replace("_", " ")}</button>
                ))}
              </div>
            </div>

            {/* NOTAS */}
            <div>
              <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Notas internas</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Agregar notas sobre la gestión..."
                rows={4}
                style={{
                  width: "100%", background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: 10, fontSize: 13, color: T.text,
                  resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.5,
                }}
              />
            </div>

            {/* BOTÓN GUARDAR */}
            <button
              onClick={handleUpdate}
              disabled={updating}
              style={{
                width: "100%", background: T.green, color: T.navy,
                border: "none", borderRadius: 8, padding: "10px 0",
                fontSize: 13, fontWeight: 700, cursor: updating ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                opacity: updating ? 0.7 : 1,
              }}
            >
              {updating ? <Spinner size={14} /> : <i className="ti ti-device-floppy" style={{ fontSize: 15 }} />}
              Guardar cambios
            </button>

            {/* RESOLUCIÓN */}
            {selected.resolvedAt && (
              <div style={{ fontSize: 12, color: T.green, textAlign: "center", opacity: 0.8 }}>
                <i className="ti ti-circle-check" style={{ fontSize: 13, marginRight: 4 }} />
                Resuelta el {fmt(selected.resolvedAt)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}