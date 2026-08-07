# Especificação Técnica de Arquitetura - Biolink 2.0

## 1. Stack Tecnológica
- **Frontend Framework:** React 19 + Vite 6 + TypeScript.
- **Styling Engine:** Tailwind CSS v4 (Aproveitando as novas capacidades de performance de compilação).
- **Backend Framework:** Hono v4 (Executado de forma nativa no Cloudflare Workers runtime).
- **Database/Storage:** Cloudflare KV Namespace (`BIOLINK_DB`).
- **Deployment & Hosting:** Cloudflare Workers com suporte nativo a Assets (Static Assets integrados).

## 2. Arquitetura de Dados (Cloudflare KV Design)
Em vez de tabelas relacionais pesadas, salvaremos toda a árvore de configuração do Biolink como um payload estruturado JSON em uma única chave centralizadora chamada `"biolink_data"`.

### Schema do Objeto JSON (`BiolinkData`):
```typescript
interface Profile {
  name: string;
  handle: string;
  role: string;
  bio: string;
  avatarUrl: string;
  verifiedBadge: boolean;
  footerText: string;
}

interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  enabled: boolean;
}

interface LinkCard {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  isFeatured: boolean;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  order: number;
  active: boolean;
  clicksCount: number;
}

interface BiolinkData {
  profile: Profile;
  socialLinks: SocialLink[];
  linkCards: LinkCard[];
}
```

## 3. Endpoints da API (Implementados no Hono)

| Método | Rota | Descrição | Autenticação |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` | Retorna o JSON completo estruturado. Se o KV estiver vazio, faz fallback para o `initialData.ts`. | Pública |
| `POST` | `/api/links/:id/click` | Incrementa atomicamente a métrica `clicksCount` do card selecionado dentro do objeto KV. | Pública |
| `POST` | `/api/auth/login` | Valida credenciais usando variáveis secretas do Worker (`env.ADMIN_EMAIL` / `env.ADMIN_PASSWORD`) e retorna um token criptográfico. | Pública |
| `GET` | `/api/auth/me` | Verifica a validade do cabeçalho `Authorization: Bearer <token>`. | Protegida |
| `PUT` | `/api/profile/save` | Recebe a carga completa de dados editada no painel e substitui a chave no KV. | Protegida (JWT/Token) |
