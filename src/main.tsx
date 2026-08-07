import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { INITIAL_BIOLINK_DATA } from "./data/initialData";
import type { BiolinkData } from "./types";
import PublicBiolink from "./components/PublicBiolink";
import AdminLogin, { TOKEN_STORAGE_KEY } from "./components/AdminLogin";

function App() {
  const [data, setData] = useState<BiolinkData>(INITIAL_BIOLINK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json() as Promise<BiolinkData>;
      })
      .then((profileData) => {
        if (!cancelled) {
          setData(profileData);
        }
      })
      .catch(() => {
        // Sem API disponível: mantém os dados iniciais como fallback.
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const path = window.location.pathname;

  if (path === "/admin" || path === "/admin/") {
    return <AdminLogin />;
  }

  if (path.startsWith("/admin/dashboard")) {
    const hasToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
    if (!hasToken) {
      return <AdminLogin />;
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-background px-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-white">Painel em construção</h1>
          <p className="mt-2 text-sm text-cyber-muted">
            O dashboard administrativo será liberado na próxima etapa.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex cursor-pointer items-center rounded-xl border border-cyber-border bg-cyber-surface/60 px-4 py-2 text-sm text-cyber-role backdrop-blur-md transition-colors hover:border-cyber-neon/40"
          >
            Voltar ao Biolink
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-background">
        <div
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-2 border-cyber-border border-t-cyber-neon"
        />
      </div>
    );
  }

  return <PublicBiolink data={data} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
