import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";

export const TOKEN_STORAGE_KEY = "biolink_admin_token";

interface AdminLoginProps {
  onLogin?: (token: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as { token?: string; error?: string };
      if (!response.ok || !body.token) {
        setError(body.error ?? "Não foi possível autenticar. Tente novamente.");
        return;
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, body.token);
      if (onLogin) {
        onLogin(body.token);
      } else {
        window.location.assign("/admin/dashboard");
      }
    } catch {
      setError("Falha de conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-cyber-border bg-cyber-background px-4 py-3 text-sm text-white placeholder:text-cyber-muted outline-none transition-colors duration-200 focus:border-cyber-neon/60 focus:ring-2 focus:ring-cyber-neon/25";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cyber-background px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyber-neon/20 blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-cyber-electric/20 blur-[110px]"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-cyber-border bg-cyber-surface/60 p-8 backdrop-blur-md">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyber-neon to-cyber-electric shadow-[0_0_24px_rgba(217,70,239,0.4)]">
          <Lock className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-center text-xl font-bold text-white">Painel Admin</h1>
        <p className="mt-1 text-center text-sm text-cyber-muted">
          Acesse para gerenciar o seu Biolink
        </p>

        <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-cyber-muted">
              Email
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-cyber-muted">
              Senha
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-muted" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </label>

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-cyber-neon to-cyber-electric px-4 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-electric disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Autenticando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
