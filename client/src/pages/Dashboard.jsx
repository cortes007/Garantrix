// pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { T } from "../styles/tokens.js";
import { apiFetch, fmt } from "../scripts/api.js";
import { Spinner, Badge, EmptyState, QRPanel } from "../components/ui.jsx";

export default function Dashboard({ setPage }) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/stats")
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* MÉTRICAS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Garantías Activas",        value: loading ? "…" : stats?.warranties?.active ?? 0, icon: "ti-shield-check",   accent: true  },
            { label: "Reclamaciones",  value: loading ? "…" : stats?.claims?.pending   ?? 0, icon: "ti-alert-triangle", accent: false },
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

        {/* TABLA GARANTÍAS RECIENTES */}
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

      {/* PANEL DERECHO */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <QRPanel />
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Resumen General</div>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 16 }}><Spinner /></div>
          ) : [
            { label: "Total garantías",  val: stats?.warranties?.total   ?? 0, color: T.text   },
            { label: "Vencidas",         val: stats?.warranties?.expired ?? 0, color: T.red    },
            { label: "Total clientes",   val: stats?.clients?.total      ?? 0, color: T.green  },
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
