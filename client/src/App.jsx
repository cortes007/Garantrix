// App.jsx — Punto de entrada principal de la app
// Orquesta la navegación entre páginas e inyecta el CSS global.

import { useState } from "react";
import { T, GLOBAL_CSS } from "./styles/tokens.js";
import { Sidebar, TopBar } from "./components/ui.jsx";

// Páginas
import Dashboard      from "./pages/Dashboard.jsx";
import NuevaGarantia  from "./pages/NuevaGarantia.jsx";
import ValidarQR      from "./pages/ValidarQR.jsx";
import Clientes       from "./pages/Clientes.jsx";
import Configuracion  from "./pages/Configuracion.jsx";

export default function App({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");

  const businessName = user?.businessName || "Mi Negocio";

  // Botón de acción en el TopBar según la página activa
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

  // Mapa de páginas
  const pages = {
    dashboard: <Dashboard     setPage={setPage} />,
    nueva:     <NuevaGarantia setPage={setPage} />,
    validar:   <ValidarQR />,
    clientes:  <Clientes      setPage={setPage} />,
    config:    <Configuracion user={user} onLogout={onLogout} />,
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar active={page} setPage={setPage} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <TopBar title={businessName} action={pageActions[page]} />
          {pages[page]}
        </div>
      </div>
    </>
  );
}
