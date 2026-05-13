// styles/tokens.js — Design tokens y CSS global de Garantix

export const T = {
  navy:      "#0B1628",
  navy2:     "#0F1E38",
  navy3:     "#162340",
  green:     "#00D68F",
  greenDim:  "#00b87a",
  greenSoft: "rgba(0,214,143,0.12)",
  blue:      "#1A7FDD",
  blueSoft:  "rgba(26,127,221,0.15)",
  text:      "#E8EDF5",
  muted:     "#7A8FA8",
  border:    "rgba(255,255,255,0.07)",
  card:      "rgba(255,255,255,0.04)",
  cardHover: "rgba(255,255,255,0.07)",
  red:       "#FF6B6B",
  yellow:    "#FFC947",
};

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: ${T.navy};
    color: ${T.text};
    min-height: 100vh;
    overflow: hidden;
  }

  input, select, textarea, button { font-family: 'DM Sans', sans-serif; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }

  @keyframes scanMove {
    0%   { top: 8%; }
    50%  { top: 88%; }
    100% { top: 8%; }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .gtx-fade { animation: fadeIn 0.25s ease both; }
  .gtx-spin { animation: spin 0.8s linear infinite; display: inline-block; }
  .gtx-row:hover { background: rgba(255,255,255,0.03); }

  .gtx-config-input:focus {
    border-color: rgba(0,214,143,0.45) !important;
    box-shadow: 0 0 0 3px rgba(0,214,143,0.07);
    outline: none;
  }
`;

// Estilos reutilizables para configuración
export const cfgInputStyle = {
  width: "100%",
  background: "rgba(0,0,0,0.2)",
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13.5,
  color: T.text,
  outline: "none",
  transition: "border-color 0.15s",
};

export const cfgLabelStyle = {
  fontSize: 12,
  color: T.muted,
  marginBottom: 5,
  display: "block",
  fontWeight: 500,
};

export const fieldStyle = {
  background: "rgba(0,0,0,0.2)",
  border: `1px solid ${T.border}`,
  borderRadius: 7,
  padding: "9px 12px",
  fontSize: 13,
  color: T.text,
  outline: "none",
  width: "100%",
};

export const labelStyle = {
  fontSize: 11.5,
  color: T.muted,
  marginBottom: 5,
  display: "block",
};
