// App.jsx — Punto de entrada principal de la app
// Orquesta la navegación entre páginas e inyecta el CSS global.
import { useState } from "react";
import { T, GLOBAL_CSS } from "./styles/tokens.js";
import { Sidebar, TopBar } from "./components/ui.jsx";

// Páginas
import Dashboard       from "./pages/Dashboard.jsx";
import NuevaGarantia   from "./pages/NuevaGarantia.jsx";
import ValidarQR       from "./pages/ValidarQR.jsx";
import Clientes        from "./pages/Clientes.jsx";
import Configuracion   from "./pages/Configuracion.jsx";
import GarantiaPublica from "./pages/GarantiaPublica.jsx";
import Reclamaciones   from "./pages/Reclamaciones.jsx";

export default function App({ user, onLogout }) {
  const [page,         setPage]         = useState("dashboard");
  const [warrantyCode, setWarrantyCode] = useState(null);

  const businessName = user?.businessName || "Mi Negocio";

  const verGarantia = (code) => {
    setWarrantyCode(code);
    setPage("garantia");
  };

  if (page === "garantia" && warrantyCode) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <button
          onClick={() => { setPage("clientes"); setWarrantyCode(null); }}
          style={{
            position: "fixed", top: 20, left: 20, zIndex: 100,
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(15,30,56,0.9)", backdropFilter: "blur(8px)",
            color: T.text, border: `1px solid ${T.border}`,
            borderRadius: 8, padding: "8px 16px",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
          }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 15 }} />
          Volver al panel
        </button>
        <div style={{ height: "100vh", overflowY: "auto" }}>
          <GarantiaPublica warrantyCode={warrantyCode} />
        </div>
      </>
    );
  }

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

  // ── Mapa de páginas ──────────────────────────────────────────
  const pages = {
    dashboard:     <Dashboard     setPage={setPage} verGarantia={verGarantia} />,
    nueva:         <NuevaGarantia setPage={setPage} verGarantia={verGarantia} />,
    validar:       <ValidarQR     verGarantia={verGarantia} />,
    clientes:      <Clientes      setPage={setPage} verGarantia={verGarantia} />,
    config:        <Configuracion user={user} onLogout={onLogout} />,
    reclamaciones: <Reclamaciones setPage={setPage} />,
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar active={page} setPage={setPage} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          <TopBar title={businessName} action={pageActions[page]} />
          <div style={{ flex: 1, position: "relative", overflow: "auto" }}>
            {pages[page]}
          </div>
        </div>
      </div>
    </>
  );
}