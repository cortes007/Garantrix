// client/src/main.jsx
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import AuthPage from "./AuthPage.jsx";
import App from "./garantix.jsx";

function Root() {
  const [user, setUser] = useState(null);       // null = no autenticado
  const [checking, setChecking] = useState(true); // verificando sesión al cargar

  // Al montar, verificar si ya hay una sesión activa (cookie)
  useEffect(() => {
    // Usamos fetch nativo (no apiFetch) para no lanzar error en 401
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  if (checking) {
    // Pantalla de carga mientras se verifica la sesión
    return (
      <div style={{
        minHeight: "100vh", background: "#0B1628",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center", color: "#7A8FA8", fontSize: 14 }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={setUser} />;
  }

  // Pasar el user al App para mostrar businessName en el dashboard
  return <App user={user} onLogout={handleLogout} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
