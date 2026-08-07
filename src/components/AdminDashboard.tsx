import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Folder,
  Globe,
  Link2,
  Loader2,
  LogOut,
  Mail,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { BiolinkData, LinkCard, Profile, SocialLink } from "../types";
import { TOKEN_STORAGE_KEY } from "./AdminLogin";

interface AdminDashboardProps {
  data: BiolinkData;
  onSaved: (data: BiolinkData) => void;
  onLogout: () => void;
}

type SaveStatus = { type: "idle" | "saving" | "success" | "error"; message?: string };

const ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "globe", label: "Globo (Site)", Icon: Globe },
  { value: "folder", label: "Pasta (Projetos)", Icon: Folder },
  { value: "sparkles", label: "Faíscas (IA)", Icon: Sparkles },
  { value: "mail", label: "Email (Newsletter)", Icon: Mail },
  { value: "link2", label: "Link genérico", Icon: Link2 },
];

const PLATFORM_OPTIONS = ["github", "linkedin", "instagram", "youtube"];

const PLATFORM_LABELS: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
};

const inputClass =
  "w-full rounded-xl border border-cyber-border bg-cyber-background px-3 py-2.5 text-sm text-white placeholder:text-cyber-muted outline-none transition-colors duration-200 focus:border-cyber-neon/60 focus:ring-2 focus:ring-cyber-neon/25";

function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-cyber-border bg-cyber-surface/60 p-5 backdrop-blur-md">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyber-role">
        {icon}
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-cyber-muted">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-neon/60 ${
        checked ? "bg-gradient-to-br from-cyber-neon to-cyber-electric" : "bg-cyber-muted/30"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function newId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Date.now().toString(36);
  return `${prefix}-${random}`;
}

export default function AdminDashboard({ data, onSaved, onLogout }: AdminDashboardProps) {
  const [draft, setDraft] = useState<BiolinkData>(() => structuredClone(data));
  const [status, setStatus] = useState<SaveStatus>({ type: "idle" });

  useEffect(() => {
    if (status.type === "success") {
      const timer = setTimeout(() => setStatus({ type: "idle" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const updateProfile = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setDraft((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
  };

  const updateSocial = (id: string, patch: Partial<SocialLink>) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((social) =>
        social.id === id ? { ...social, ...patch } : social
      ),
    }));
  };

  const updateCard = (id: string, patch: Partial<LinkCard>) => {
    setDraft((prev) => ({
      ...prev,
      linkCards: prev.linkCards.map((card) => (card.id === id ? { ...card, ...patch } : card)),
    }));
  };

  const setFeatured = (id: string) => {
    setDraft((prev) => {
      const target = prev.linkCards.find((card) => card.id === id);
      if (!target) {
        return prev;
      }
      const makeFeatured = !target.isFeatured;
      return {
        ...prev,
        linkCards: prev.linkCards.map((card) => ({
          ...card,
          isFeatured: makeFeatured ? card.id === id : false,
        })),
      };
    });
  };

  const reindex = (cards: LinkCard[]): LinkCard[] =>
    cards.map((card, index) => ({ ...card, order: index + 1 }));

  const addCard = () => {
    const card: LinkCard = {
      id: newId("link"),
      title: "Novo Link",
      subtitle: "",
      url: "https://",
      isFeatured: false,
      icon: "globe",
      iconBgColor: "bg-[#161224]",
      iconColor: "#D946EF",
      order: draft.linkCards.length + 1,
      active: true,
      clicksCount: 0,
    };
    setDraft((prev) => ({ ...prev, linkCards: [...prev.linkCards, card] }));
  };

  const removeCard = (id: string) => {
    setDraft((prev) => ({ ...prev, linkCards: reindex(prev.linkCards.filter((card) => card.id !== id)) }));
  };

  const moveCard = (id: string, direction: -1 | 1) => {
    setDraft((prev) => {
      const cards = [...prev.linkCards];
      const index = cards.findIndex((card) => card.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= cards.length) {
        return prev;
      }
      const [card] = cards.splice(index, 1);
      cards.splice(target, 0, card);
      return { ...prev, linkCards: reindex(cards) };
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      onLogout();
      return;
    }
    setStatus({ type: "saving" });
    try {
      const response = await fetch("/api/profile/save", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(draft),
      });
      if (response.status === 401) {
        setStatus({ type: "error", message: "Sessão expirada. Faça login novamente." });
        onLogout();
        return;
      }
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        setStatus({ type: "error", message: body.error ?? "Falha ao salvar os dados." });
        return;
      }
      onSaved(structuredClone(draft));
      setStatus({ type: "success", message: "Dados salvos e sincronizados." });
    } catch {
      setStatus({ type: "error", message: "Falha de conexão com o servidor." });
    }
  };

  const orderedCards = [...draft.linkCards].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-cyber-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Painel Admin</h1>
          <p className="mt-1 text-sm text-cyber-muted">
            Edite o perfil e os links do seu Biolink{" "}
            <span className="text-cyber-role">{draft.profile.handle}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyber-border bg-cyber-surface/60 px-3 py-2 text-sm text-cyber-muted transition-colors hover:border-cyber-neon/40 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
            Ver público
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-cyber-border bg-cyber-surface/60 px-3 py-2 text-sm text-cyber-muted transition-colors hover:border-red-400/50 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-6">
        <Section
          title="Perfil"
          icon={<Globe className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Nome"
              value={draft.profile.name}
              onChange={(value) => updateProfile("name", value)}
              placeholder="Rafa Franco"
            />
            <Field
              label="Handle"
              value={draft.profile.handle}
              onChange={(value) => updateProfile("handle", value)}
              placeholder="@rafafranco.ia"
            />
          </div>
          <Field
            label="Cargo"
            value={draft.profile.role}
            onChange={(value) => updateProfile("role", value)}
            placeholder="Especialista em IA & Desenvolvedor Full Stack"
          />
          <Field
            label="Biografia"
            value={draft.profile.bio}
            onChange={(value) => updateProfile("bio", value)}
            placeholder="Descreva o que você faz..."
            textarea
          />
          <Field
            label="Texto do rodapé"
            value={draft.profile.footerText}
            onChange={(value) => updateProfile("footerText", value)}
            placeholder="© 2026 Rafa Franco"
          />
        </Section>

        <Section title="Redes Sociais">
          {draft.socialLinks.map((social) => (
            <div
              key={social.id}
              className="flex flex-col gap-3 rounded-xl border border-cyber-border bg-cyber-background/60 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Toggle
                    checked={social.enabled}
                    onChange={(checked) => updateSocial(social.id, { enabled: checked })}
                    label={`Habilitar ${social.label}`}
                  />
                  <span
                    className={`text-sm font-medium ${social.enabled ? "text-white" : "text-cyber-muted"}`}
                  >
                    {social.label}
                  </span>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-cyber-muted">
                  <span>Plataforma</span>
                  <select
                    value={social.platform}
                    onChange={(event) =>
                      updateSocial(social.id, {
                        platform: event.target.value,
                        label: PLATFORM_LABELS[event.target.value] ?? event.target.value,
                      })
                    }
                    className={`${inputClass} w-auto`}
                  >
                    {PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform} value={platform} className="bg-cyber-surface">
                        {PLATFORM_LABELS[platform]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Nome exibido"
                  value={social.label}
                  onChange={(value) => updateSocial(social.id, { label: value })}
                  placeholder="GitHub"
                />
                <Field
                  label="URL"
                  value={social.url}
                  onChange={(value) => updateSocial(social.id, { url: value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </Section>

        <Section
          title="Cards de Links"
          icon={<Star className="h-4 w-4" />}
        >
          <p className="text-xs leading-relaxed text-cyber-muted">
            Use a estrela para definir o{" "}
            <span className="font-medium text-cyber-role">Destaque Principal</span> (gradiente
            total). Os demais cards são exibidos com efeito Glassmorphism.
          </p>

          {orderedCards.map((card) => (
            <div
              key={card.id}
              className={`rounded-xl border p-3 transition-colors duration-200 ${
                card.isFeatured
                  ? "border-cyber-neon/50 bg-cyber-neon/10"
                  : "border-cyber-border bg-cyber-background/60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFeatured(card.id)}
                    title={card.isFeatured ? "Remover destaque" : "Definir como destaque"}
                    aria-pressed={card.isFeatured}
                    aria-label={`Definir "${card.title}" como destaque principal`}
                    className={`cursor-pointer rounded-lg p-1.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-neon/60 ${
                      card.isFeatured ? "text-cyber-neon" : "text-cyber-muted hover:text-cyber-role"
                    }`}
                  >
                    <Star className={`h-5 w-5 ${card.isFeatured ? "fill-current" : ""}`} />
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-wide text-cyber-muted">
                    Card {card.order}
                  </span>
                  {card.isFeatured ? (
                    <span className="rounded-full bg-gradient-to-br from-cyber-neon to-cyber-electric px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Destaque
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveCard(card.id, -1)}
                    disabled={card.order === 1}
                    title="Mover para cima"
                    aria-label={`Mover "${card.title}" para cima`}
                    className="cursor-pointer rounded-lg p-1.5 text-cyber-muted transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-neon/60 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCard(card.id, 1)}
                    disabled={card.order === orderedCards.length}
                    title="Mover para baixo"
                    aria-label={`Mover "${card.title}" para baixo`}
                    className="cursor-pointer rounded-lg p-1.5 text-cyber-muted transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-neon/60 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <Toggle
                    checked={card.active}
                    onChange={(checked) => updateCard(card.id, { active: checked })}
                    label={`Habilitar card ${card.title}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeCard(card.id)}
                    title="Remover card"
                    aria-label={`Remover card ${card.title}`}
                    className="cursor-pointer rounded-lg p-1.5 text-cyber-muted transition-colors hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Título"
                  value={card.title}
                  onChange={(value) => updateCard(card.id, { title: value })}
                  placeholder="Meu Site"
                />
                <Field
                  label="Subtítulo"
                  value={card.subtitle}
                  onChange={(value) => updateCard(card.id, { subtitle: value })}
                  placeholder="Descrição curta"
                />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="URL"
                  value={card.url}
                  onChange={(value) => updateCard(card.id, { url: value })}
                  placeholder="https://..."
                />
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-cyber-muted">
                    Ícone
                  </span>
                  <select
                    value={card.icon}
                    onChange={(event) => updateCard(card.id, { icon: event.target.value })}
                    className={inputClass}
                  >
                    {ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-cyber-surface">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-cyber-border pt-3">
                <span className="text-xs text-cyber-muted">
                  Cliques registrados:{" "}
                  <span className="font-semibold text-white">{card.clicksCount}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateCard(card.id, { clicksCount: 0 })}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyber-border px-2.5 py-1.5 text-xs text-cyber-muted transition-colors hover:border-cyber-neon/40 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Resetar contador
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addCard}
            className="mt-1 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-cyber-neon/40 px-4 py-3 text-sm font-medium text-cyber-role transition-colors hover:border-cyber-neon hover:bg-cyber-neon/10"
          >
            <Plus className="h-4 w-4" />
            Adicionar novo card
          </button>
        </Section>

        <div className="sticky bottom-4 z-10 rounded-2xl border border-cyber-border bg-cyber-surface/80 p-4 backdrop-blur-md">
          {status.type === "error" ? (
            <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {status.message}
            </p>
          ) : null}
          {status.type === "success" ? (
            <p className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              <Check className="h-4 w-4" />
              {status.message}
            </p>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={status.type === "saving"}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-cyber-neon to-cyber-electric px-4 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-electric disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.type === "saving" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
