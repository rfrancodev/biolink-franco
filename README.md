# 🌃 Cyberpunk Biolink v2

> Um **link na bio** com personalidade própria: visual cyberpunk, carregamento instantâneo e um painel admin para você editar tudo em tempo real — sem tocar em código.

🌍 **No ar em:** [**bio.francorafael.com**](https://bio.francorafael.com)

---

<p align="center">
  <strong>⚡ Frontend</strong> · <strong>🛰️ Backend</strong> · <strong>💾 Dados globais</strong><br/>
  <sub>React 19 · Vite · Tailwind v4 · Hono · Cloudflare Workers · Cloudflare KV</sub>
</p>

---

## ✨ Por que esse projeto chama atenção?

Este não é só mais um "link na bio". Ele foi construído de ponta a ponta com **arquitetura serverless real**, onde o site e a API vivem juntos na mesma infraestrutura e os dados viajam pela rede global da Cloudflare:

- 🎨 **Identidade visual própria** — tema dark cyberpunk com efeito *glassmorphism*, gradientes neon e micro-interações.
- ⚡ **Carregamento instantâneo** — o público vê o perfil em milissegundos, com dados distribuídos globalmente.
- 🛡️ **Segurança de verdade** — login protegido com token criptográfico (HMAC-SHA256), URLs sanitizadas e validação de payloads.
- 📊 **Métricas embutidas** — cada clique em um link é contado silenciosamente, sem atrapalhar a navegação.
- 🧑‍💻 **Painel administrativo** — edite bio, links e redes sociais pelo navegador, em qualquer lugar do mundo, e a mudança vale para todos na hora.
- 🌍 **Sem servidor para manter** — tudo roda em Cloudflare Workers com um único comando de deploy.

---

## 📱 O que dá para fazer

### Para quem visita (rota pública `/`)
- Ver avatar com anel neon, nome verificado, cargo e bio.
- Acessar redes sociais e cards de links com um toque.
- Cada clique conta uma métrica — você fica sabendo o que o público mais acessa.

### Para o dono (rota `/admin`)
1. Faça login com seu e-mail e senha.
2. Edite sua bio, reorganize cards, troque links e redes sociais.
3. Clique em **Salvar** — pronto, está no ar para todos.

> 🔒 Só quem tem as credenciais corretas entra. O sistema valida o token a cada acesso e bloqueia sessões inválidas.

---

## 🗺️ Como rodar na sua máquina

### Pré-requisitos
- **Node.js** (18 ou superior) e **npm**
- Conta gratuita na **Cloudflare** (para deploy)

### 1. Instalar e rodar em modo desenvolvimento

```bash
npm install
npx wrangler dev --port 8787
```

Abra **http://localhost:8787** no navegador. É aqui que o *link na bio* aparece.

### 2. Criar suas credenciais de acesso (obrigatório)

Crie o arquivo `.dev.vars` na raiz do projeto (ele já é ignorado pelo Git, então seus segredos ficam seguros):

```env
ADMIN_EMAIL=voce@exemplo.com
ADMIN_PASSWORD=umasenhabemforte
```

> ⚠️ Sem esse arquivo, o painel admin não aceita login.

### 3. Acessar o painel

Navegue até **http://localhost:8787/admin** e entre com o e-mail e senha do `.dev.vars`.

### 4. Build de produção

```bash
npm run build    # gera a pasta ./dist pronta para subir
```

### 5. Deploy na Cloudflare

```bash
npm run deploy   # faz build + publica no Workers
```

Em produção, configure os segredos com:

```bash
wrangler secret put ADMIN_EMAIL
wrangler secret put ADMIN_PASSWORD
```

> ✅ Deploy pronto: o KV já está vinculado em `wrangler.toml` e a aplicação roda em [bio.francorafael.com](https://bio.francorafael.com).

---

## 🧩 Como adaptar para o SEU perfil

Tudo o que aparece na página é controlado por um único arquivo: `src/data/initialData.ts`. É o "molde" que o sistema usa quando ainda não há dados salvos.

### Edite e pronto:

| O quê | Onde |
|---|---|
| Seu nome, bio, cargo | `profile` |
| Seu avatar | `avatarUrl` (troque o arquivo em `src/assets/images/`) |
| Suas redes sociais | `socialLinks` (GitHub, LinkedIn, Instagram, YouTube...) |
| Seus links | `linkCards` (site, portfólio, contato...) |

### Exemplo de um card de link:

```ts
{
  id: "link-site",
  title: "Meu site",                        // o que aparece no card
  subtitle: "https://meusite.com",          // texto de apoio
  url: "https://meusite.com",               // para onde ele leva
  isFeatured: true,                          // true = card em destaque (gradiente)
  icon: "globe",                             // ícone do card
  order: 1,                                  // posição na lista
  active: true,                              // visível ou não
  clicksCount: 0,                            // contador de cliques
}
```

Quer adicionar um link novo? Copie um bloco desses, mude os valores e aumente o `order`. Está feito. 🎉

---

## 🧠 Pontos-chave da arquitetura (resumo amigável)

| Camada | O que faz | Onde vive |
|---|---|---|
| 🎨 **Interface** | A página que o visitante vê, com tema cyberpunk | `src/App.tsx`, `src/components/` |
| 🛰️ **API** | As regras de negócio: perfil, cliques, login, salvar | `src/index.ts` |
| 💾 **Dados** | Onde tudo é guardado, distribuído no mundo todo | Cloudflare KV (`BIOLINK_DB`) |
| 🧬 **Molde inicial** | O perfil padrão usado antes de qualquer edição | `src/data/initialData.ts` |
| 🔒 **Segurança** | Token criptográfico + sanitização de URLs | `src/index.ts`, `src/lib/urlSanitizer.ts` |

**O truque por trás dos panos:** em vez de um banco de dados tradicional, todo o conteúdo é um único documento JSON guardado no Cloudflare KV. Isso torna o projeto simples, rápido e escalável — e foi feito exatamente assim para rodar em escala global sem custo de servidor dedicado.

---

## 🧪 Testes

O projeto prioriza validação por construção e testes manuais:

```bash
npm run typecheck   # confere os tipos do TypeScript (front + worker) — esperado 0 erros
npm run build       # gera o build de produção
```

Fluxo manual recomendado:
1. Rode o servidor local e confira a página pública.
2. Clique em um card e veja o contador de cliques no console/Network.
3. Entre em `/admin`, faça login, edite a bio e salve.
4. Recarregue a página pública e veja a mudança aplicada na hora.

---

## 📁 Estrutura do projeto

```
├── src/
│   ├── App.tsx                  # Roteador e controle de sessão
│   ├── index.ts                 # API (Hono) — o coração do backend
│   ├── components/              # Telas: público, login e painel admin
│   ├── data/initialData.ts      # ⭐ O arquivo para personalizar tudo
│   ├── lib/urlSanitizer.ts      # Proteção contra URLs maliciosas
│   ├── types/index.ts           # Modelagem dos dados
│   └── assets/images/           # Seu avatar e imagens
├── wrangler.toml                # Configuração da Cloudflare
├── vite.config.ts               # Configuração do frontend
└── Tasks.md                     # Roadmap técnico completo
```

---

## 🚀 Roadmap e evolução

- ✅ Fase 1 — Infraestrutura e fundação
- ✅ Fase 2 — Modelagem de dados
- ✅ Fase 3 — API serverless + segurança
- ✅ Fase 4 — Interface cyberpunk
- ✅ Fase 5 — Painel administrativo
- ✅ Deploy — Cloudflare Workers + domínio customizado (`bio.francorafael.com`)
- 🔒 + Auditoria de segurança aplicada (XSS, payloads, condição de corrida)

Veja o [`Tasks.md`](./Tasks.md) para o relatório detalhado de cada fase e os testes realizados.

---

<p align="center">
  Feito com <span style="color:#D946EF">♥</span> e muito café · <strong>Rafa Franco</strong><br/>
  <sub>@rafafranco.ia</sub>
</p>
