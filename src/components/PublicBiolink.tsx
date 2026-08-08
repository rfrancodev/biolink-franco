import { useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Folder,
  Globe,
  Mail,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { BiolinkData, LinkCard, SocialLink } from "../types";
import { sanitizeUrl } from "../lib/urlSanitizer";

interface PublicBiolinkProps {
  data: BiolinkData;
}

const CARD_ICONS: Record<string, LucideIcon> = {
  globe: Globe,
  folder: Folder,
  sparkles: Sparkles,
  mail: Mail,
};

const AVATAR_ASSETS = import.meta.glob<string>(
  "../assets/images/*.{jpeg,jpg,png,webp,avif,gif}",
  { eager: true, import: "default" }
);

function resolveAvatarUrl(fallback: string): string {
  const names = Object.keys(AVATAR_ASSETS);
  if (names.length === 0) {
    return fallback;
  }
  const preferred = names.find((name) => /imagem-avatar/i.test(name)) ?? names[0];
  return AVATAR_ASSETS[preferred] ?? fallback;
}

const BRAND_PATHS: Record<string, string> = {
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  instagram:
    "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  youtube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
};

function BrandIcon({ platform, className }: { platform: string; className?: string }) {
  const path = BRAND_PATHS[platform];
  if (!path) {
    return <Globe className={className} />;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

function Avatar({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="rounded-full bg-gradient-to-br from-cyber-neon to-cyber-electric p-[4px]">
      {failed ? (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-cyber-surface text-2xl font-bold text-cyber-neon">
          {initials}
        </div>
      ) : (
        <img
          src={src}
          alt={`Avatar de ${name}`}
          onError={() => setFailed(true)}
          className="h-24 w-24 rounded-full border-2 border-cyber-background object-cover"
        />
      )}
    </div>
  );
}

export default function PublicBiolink({ data }: PublicBiolinkProps) {
  const { profile, socialLinks, linkCards } = data;

  const activeSocials = socialLinks.filter((social) => social.enabled);
  const orderedCards = [...linkCards]
    .filter((card) => card.active)
    .sort((a, b) => a.order - b.order);

  const trackClick = (link: LinkCard) => {
    void fetch(`/api/links/${link.id}/click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {
      // Telemetria em segundo plano: falha não deve bloquear o clique.
    });
  };

  const renderSocial = (social: SocialLink) => (
    <a
      key={social.id}
      href={sanitizeUrl(social.url)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      title={social.label}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-cyber-border bg-cyber-surface text-cyber-muted transition-colors duration-200 hover:border-cyber-neon/40 hover:text-cyber-neon focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-neon/60"
    >
      <BrandIcon platform={social.platform} className="h-5 w-5" />
    </a>
  );

  const renderCard = (link: LinkCard) => {
    const Icon = CARD_ICONS[link.icon] ?? Globe;
    if (link.isFeatured) {
      return (
        <a
          key={link.id}
          href={sanitizeUrl(link.url)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(link)}
          className="group flex cursor-pointer items-center gap-3 rounded-2xl bg-gradient-to-br from-cyber-neon to-cyber-electric px-4 py-4 text-white transition-shadow duration-300 hover:shadow-[0_0_32px_rgba(217,70,239,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-electric"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold">{link.title}</span>
            {link.subtitle ? (
              <span className="block truncate text-xs text-white/80">{link.subtitle}</span>
            ) : null}
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      );
    }

    return (
      <a
        key={link.id}
        href={sanitizeUrl(link.url)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(link)}
        className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-cyber-border bg-cyber-surface/60 px-4 py-4 text-white backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:border-cyber-neon/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyber-neon/60"
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${link.iconBgColor}`}
          style={{ color: link.iconColor }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-semibold">{link.title}</span>
          {link.subtitle ? (
            <span className="block truncate text-xs text-cyber-muted">{link.subtitle}</span>
          ) : null}
        </span>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-cyber-muted opacity-70 transition-colors duration-200 group-hover:text-cyber-neon" />
      </a>
    );
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center px-6 py-10">
      <header className="flex flex-col items-center text-center">
        <Avatar src={resolveAvatarUrl(profile.avatarUrl)} name={profile.name} />
        <h1 className="mt-5 flex items-center gap-1.5 text-xl font-bold tracking-tight text-white">
          <span>{profile.handle}</span>
          {profile.verifiedBadge ? (
            <BadgeCheck className="h-5 w-5 shrink-0 text-cyber-electric" aria-label="Verificado" />
          ) : null}
        </h1>
        <p className="mt-1 text-sm font-medium text-cyber-role">{profile.role}</p>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-cyber-muted">{profile.bio}</p>
      </header>

      <nav aria-label="Redes sociais" className="mt-7 flex items-center gap-3">
        {activeSocials.map(renderSocial)}
      </nav>

      <main className="mt-8 flex w-full flex-col gap-3">{orderedCards.map(renderCard)}</main>

      <footer className="mt-10 text-center text-xs text-cyber-muted">
        {profile.footerText}
      </footer>
    </div>
  );
}
