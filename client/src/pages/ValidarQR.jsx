import { useState } from "react";
import { T } from "../styles/tokens.js";
import { apiFetch, fmt } from "../scripts/api.js";
import { Spinner, Badge, QRPanel } from "../components/ui.jsx";
import QRScanner from "../components/QRScanner.jsx"; // IMPORTAMOS EL NUEVO ESCÁNER

export default function ValidarQR() {
  const [cameraOn, setCameraOn] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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

  // Esta función es llamada automáticamente por el QRScanner cuando detecta un código
  const handleQRLeido = (codigoDecodificado) => {
    setCameraOn(false); // Apagamos la cámara
    setCode(codigoDecodificado); // Ponemos el código en el input
    validate(codigoDecodificado); // Disparamos la validación de inmediato
  };

  const resultBorder = result === null ? T.border : result.ok ? "rgba(0,214,143,0.3)" : "rgba(255,107,107,0.3)";

  const corners = [
    ["tl","3px 0 0 3px","3px 0 0 3px"],["tr","3px 3px 0 0","0 3px 0 0"],
    ["bl","0 0 3px 3px","0 0 0 3px"],  ["br","0 3px 3px 0","0 0 3px 0"],
  ];

  return (
    <div className="gtx-fade" style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 260px", gap: 20, flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", flex: 1 }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <i className="ti ti-qrcode" style={{ fontSize: 18, color: T.green }} />
            <span style={{ fontFamily: "Syne", fontSize: 15, fontWeight: 600 }}>Validación de Garantía</span>
          </div>

          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* COLUMNA: CÁMARA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenSoft, border: `1px solid rgba(0,214,143,0.3)`, color: T.green, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
                Escanear Código QR
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${cameraOn ? "rgba(0,214,143,0.5)" : T.border}`, borderRadius: 10, aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, position: "relative", overflow: "hidden" }}>
                
                {/* --- AQUI REEMPLAZAMOS CON EL NUEVO SCANNER --- */}
                {cameraOn ? (
                  <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                    <QRScanner onScanSuccess={handleQRLeido} />
                  </div>
                ) : (
                  <>
                    {corners.map(([k, bw, br]) => (
                      <div key={k} style={{ position: "absolute", width: 18, height: 18, borderColor: T.green, borderStyle: "solid", borderWidth: bw, borderRadius: br, opacity: 0.7, ...(k==="tl"?{top:10,left:10}:k==="tr"?{top:10,right:10}:k==="bl"?{bottom:10,left:10}:{bottom:10,right:10}) }} />
                    ))}
                    <i className="ti ti-camera" style={{ fontSize: 36, color: T.muted, opacity: 0.4 }} />
                    <span style={{ fontSize: 12, color: T.muted }}>
                      Apunta la cámara al código QR
                    </span>
                  </>
                )}
                {/* ----------------------------------------------- */}

                <button 
                  onClick={() => setCameraOn(c => !c)} 
                  style={{ 
                    position: cameraOn ? 'absolute' : 'relative', // Si está encendida, el botón flota encima
                    bottom: cameraOn ? 10 : 0, 
                    zIndex: 10,
                    marginTop: cameraOn ? 0 : 4, 
                    padding: "8px 16px", 
                    background: cameraOn ? "rgba(0,0,0,0.7)" : T.greenSoft, 
                    color: T.green, 
                    border: `1px solid rgba(0,214,143,0.3)`, 
                    borderRadius: 7, 
                    fontSize: 12, 
                    fontWeight: 500, 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6 
                  }}
                >
                  <i className={cameraOn ? "ti ti-camera-off" : "ti ti-camera"} style={{ fontSize: 14 }} />
                  {cameraOn ? "Detener Cámara" : "Activar Cámara"}
                </button>
              </div>

              {/* BÚSQUEDA MANUAL */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={code}
                  onChange={e => { setCode(e.target.value); setResult(null); }}
                  onKeyDown={e => e.key === "Enter" && validate()}
                  placeholder="O ingresa el ID: #GTX-XXXX"
                  style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 12px", fontSize: 12, color: T.text, outline: "none" }}
                />
                <button onClick={() => validate()} disabled={loading || !code.trim()} style={{ padding: "9px 14px", background: T.green, color: T.navy, border: "none", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  {loading ? <Spinner size={14} /> : <i className="ti ti-search" style={{ fontSize: 14 }} />}
                </button>
              </div>
            </div>

            {/* COLUMNA: RESULTADO */}
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
                {loading && <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size={28} /></div>}
                {result?.ok && (
                  <div className="gtx-fade" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 12, color: T.muted }}>ID: <span style={{ color: T.green, fontWeight: 600 }}>{result.warranty.warrantyCode}</span></div>
                      <div style={{ fontFamily: "Syne", fontSize: 22, fontWeight: 700, color: T.green }}>✓ VÁLIDA</div>
                      <Badge status={result.warranty.status} />
                    </div>
                    {[
                      ["Cliente",  result.warranty.clientId?.name],
                      ["Email",    result.warranty.clientId?.email],
                      ["Producto", result.warranty.product],
                      ["Inicio",   fmt(result.warranty.startDate)],
                      ["Vence",    fmt(result.warranty.endDate)],
                      ["Negocio",  result.warranty.userId?.businessName],
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

      {/* PANEL DERECHO */}
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