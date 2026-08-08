import { Hono } from "hono";
import type { Context } from "hono";
import { cors } from "hono/cors";
import { INITIAL_BIOLINK_DATA } from "./data/initialData";
import type { BiolinkData } from "./types";

const KV_KEY = "biolink_data";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export type Env = {
  BIOLINK_DB: KVNamespace;
  ASSETS: Fetcher;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({ origin: "*" }));

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  return atob(input.replace(/-/g, "+").replace(/_/g, "/"));
}

async function signToken(secret: string, email: string): Promise<string> {
  const encoder = new TextEncoder();
  const payload = toBase64Url(
    JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS })
  );
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const sig = toBase64Url(String.fromCharCode(...new Uint8Array(signature)));
  return `${payload}.${sig}`;
}

async function verifyToken(secret: string, token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  try {
    const decoded = JSON.parse(fromBase64Url(payload));
    if (!decoded.exp || Math.floor(Date.now() / 1000) >= decoded.exp) return false;
  } catch {
    return false;
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = Uint8Array.from(fromBase64Url(sig), (c) => c.charCodeAt(0));
  return crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
}

async function requireAuth(c: Context<{ Bindings: Env }>, next: () => Promise<void>): Promise<Response | void> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Não autorizado" }, 401);
  }
  const token = authHeader.slice("Bearer ".length);
  const valid = await verifyToken(c.env.ADMIN_PASSWORD, token);
  if (!valid) {
    return c.json({ error: "Sessão inválida ou expirada" }, 401);
  }
  await next();
}

app.get("/api/profile", async (c) => {
  const stored = await c.env.BIOLINK_DB.get<BiolinkData>(KV_KEY, "json");
  const data: BiolinkData = stored ?? structuredClone(INITIAL_BIOLINK_DATA);
  try {
    const listed = await c.env.BIOLINK_DB.list({ prefix: "clicks:" });
    if (listed.keys.length > 0) {
      const counts = await Promise.all(
        listed.keys.map(async (k) => ({
          id: k.name.slice("clicks:".length),
          count: parseInt((await c.env.BIOLINK_DB.get(k.name)) ?? "0", 10) || 0,
        }))
      );
      const countMap = new Map(counts.map((entry) => [entry.id, entry.count]));
      data.linkCards = data.linkCards.map((card) => ({
        ...card,
        clicksCount: countMap.get(card.id) ?? card.clicksCount,
      }));
    }
  } catch {
    // Mantém os valores originais em caso de falha na leitura.
  }
  return c.json(data);
});

app.post("/api/links/:id/click", async (c) => {
  const id = c.req.param("id");
  const clickKey = `clicks:${id}`;
  let count: number;
  try {
    const current = await c.env.BIOLINK_DB.get(clickKey);
    count = (current ? parseInt(current, 10) : 0) + 1;
    await c.env.BIOLINK_DB.put(clickKey, String(count));
  } catch {
    const stored = await c.env.BIOLINK_DB.get<BiolinkData>(KV_KEY, "json");
    const data: BiolinkData = stored ?? structuredClone(INITIAL_BIOLINK_DATA);
    const card = data.linkCards.find((link) => link.id === id);
    if (!card) {
      return c.json({ error: "Card de link não encontrado" }, 404);
    }
    card.clicksCount += 1;
    await c.env.BIOLINK_DB.put(KV_KEY, JSON.stringify(data));
    count = card.clicksCount;
  }
  return c.json({ id, clicksCount: count });
});

app.post("/api/auth/login", async (c) => {
  const body = await c.req.json();
  const email = body?.email;
  const password = body?.password;
  if (email === c.env.ADMIN_EMAIL && password === c.env.ADMIN_PASSWORD) {
    const token = await signToken(c.env.ADMIN_PASSWORD, email);
    return c.json({ token });
  }
  return c.json({ error: "Credenciais inválidas" }, 401);
});

app.get("/api/auth/me", requireAuth, (c) => {
  return c.json({ authenticated: true });
});

const MAX_STRING_LEN = 500;
const BLOCKED_URL_RE = /^(javascript|data|vbscript):/i;

app.put("/api/profile/save", requireAuth, async (c) => {
  const body = await c.req.json<BiolinkData>();
  if (!body || !body.profile || !Array.isArray(body.socialLinks) || !Array.isArray(body.linkCards)) {
    return c.json({ error: "Payload inválido" }, 400);
  }

  if (
    (body.profile.name?.length ?? 0) > MAX_STRING_LEN ||
    (body.profile.role?.length ?? 0) > MAX_STRING_LEN ||
    (body.profile.bio?.length ?? 0) > MAX_STRING_LEN ||
    (body.profile.footerText?.length ?? 0) > MAX_STRING_LEN
  ) {
    return c.json({ error: "Campos de texto excedem o limite de 500 caracteres" }, 400);
  }

  for (const card of body.linkCards) {
    if ((card.title?.length ?? 0) > 200 || (card.subtitle?.length ?? 0) > 300) {
      return c.json({ error: `Texto do card "${card.title}" excede o limite` }, 400);
    }
    if (card.url && BLOCKED_URL_RE.test(card.url.trim())) {
      return c.json({ error: `URL bloqueada no card "${card.title}"` }, 400);
    }
  }

  for (const link of body.socialLinks) {
    if (link.url && BLOCKED_URL_RE.test(link.url.trim())) {
      return c.json({ error: `URL bloqueada em rede social "${link.label}"` }, 400);
    }
  }

  await c.env.BIOLINK_DB.put(KV_KEY, JSON.stringify(body));
  return c.json({ ok: true });
});

app.notFound(async (c) => {
  const asset = await c.env.ASSETS.fetch(c.req.raw);
  if (asset.status === 404) {
    return c.env.ASSETS.fetch(new Request(new URL("/index.html", c.req.url)));
  }
  return asset;
});

export default app;
