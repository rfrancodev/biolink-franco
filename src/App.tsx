import { useCallback, useEffect, useState } from "react";
import { INITIAL_BIOLINK_DATA } from "./data/initialData";
import type { BiolinkData } from "./types";
import PublicBiolink from "./components/PublicBiolink";
import AdminLogin, { TOKEN_STORAGE_KEY } from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function navigate(to: string): void {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function usePathname(): string {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  useEffect(() => {
    const onChange = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);
  return pathname;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cyber-background">
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-2 border-cyber-border border-t-cyber-neon"
      />
    </div>
  );
}

export default function App() {
  const pathname = usePathname();
  const [data, setData] = useState<BiolinkData>(INITIAL_BIOLINK_DATA);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => getToken());

  const isAdminArea = pathname.startsWith("/admin");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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

  useEffect(() => {
    const syncToken = () => setToken(getToken());
    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  useEffect(() => {
    if (!isAdminArea || !token) {
      return;
    }
    let cancelled = false;
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!cancelled && !response.ok) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
          navigate("/admin");
        }
      })
      .catch(() => {
        // Sem rede: mantém a sessão local para não travar o painel.
      });
    return () => {
      cancelled = true;
    };
  }, [isAdminArea, token]);

  const handleLogin = useCallback((newToken: string) => {
    setToken(newToken);
    navigate("/admin/dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    navigate("/admin");
  }, []);

  const handleSaved = useCallback((saved: BiolinkData) => {
    setData(saved);
  }, []);

  if (isAdminArea) {
    if (!token) {
      return <AdminLogin onLogin={handleLogin} />;
    }
    if (loading) {
      return <LoadingScreen />;
    }
    return (
      <AdminDashboard
        data={data}
        onSaved={handleSaved}
        onLogout={handleLogout}
      />
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return <PublicBiolink data={data} />;
}
