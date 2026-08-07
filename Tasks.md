# 🗺️ Roadmap de Desenvolvimento: Cyberpunk Biolink v2 (Cloudflare Native)

Este documento contém o escopo técnico dividido em tasks sequenciais para a reconstrução do projeto Biolink utilizando **Vite + React + Tailwind v4** no Frontend e **Hono + Cloudflare Workers + KV** no Backend.

---

## 🚀 TASK 1: Inicialização do Projeto e Configuração da Infraestrutura

### 📝 Tarefa
Configurar o ambiente base do projeto com foco em arquitetura serverless unificada, garantindo que o deploy do Frontend (Assets) e Backend (Worker) ocorra através de um único comando utilizando caminhos de build estritamente relativos.

1. **Gerar o arquivo `package.json`** com suporte a módulos ESM e os scripts de automação:
   - `"dev": "vite"`
   - `"build": "vite build"`
   - `"deploy": "npm run build && wrangler deploy"`
2. **Gerar o arquivo `wrangler.toml`** configurando o ponto de entrada do Worker em `src/index.ts`, a diretiva de arquivos estáticos `[assets]` apontando para `./dist` com o binding `ASSETS`, e o namespace `[[kv_namespaces]]` nomeado como `BIOLINK_DB`.
3. **Gerar o arquivo `vite.config.ts`** contendo a propriedade `base: './'` e o plugin oficial do Tailwind v4 (`@tailwindcss/vite`).
4. **Gerar o arquivo `tsconfig.json`** configurado para TypeScript estrito compatível com React 19 e ambientes de Worker.

### 🧪 Executar Teste
- Executar `npm install` localmente para validar a árvore de dependências e checar se há conflitos de pacotes.
- Executar o comando de compilação de teste `npx vite build` para checar se a pasta `./dist` é gerada com sucesso.

### 🔍 Auto-Review
- O arquivo `vite.config.ts` possui a linha `base: './'`? (Se não tiver, o site carregará em branco no subdomínio).
- O arquivo `wrangler.toml` está mapeando a pasta `./dist` corretamente dentro do bloco `[assets]`?
- Existe algum resquício de bibliotecas do Node tradicional (como `express` ou `dotenv`) no `package.json`? (Se sim, remova-as).

### 📦 Handoff
Esta tarefa estará concluída quando os arquivos `package.json`, `wrangler.toml`, `vite.config.ts` e `tsconfig.json` estiverem criados na raiz do projeto e o comando `npm run build` gerar a pasta `./dist` sem erros no console.

---

## ⚙️ TASK 2: Camada de Tipagem e Dados Iniciais (Data & Types)

### 📝 Tarefa
Criar a modelagem de dados estrita em TypeScript e o arquivo de fallback estático que servirá de semente inicial para o banco de dados e estado do front-end.

1. **Criar o arquivo `src/types/index.ts`** contendo as interfaces estruturadas: `Profile`, `SocialLink`, `LinkCard` e o agregador `BiolinkData`. O `LinkCard` deve conter obrigatoriamente a propriedade `clicksCount: number`.
2. **Criar o arquivo `src/data/initialData.ts`** exportando a constante `INITIAL_BIOLINK_DATA` baseada no tipo `BiolinkData`. Preencha com os dados do Rafa Franco (`@rafafranco.ia`), os links de redes sociais funcionais e pelo menos 4 cards de links iniciais, marcando o primeiro como `isFeatured: true`. O caminho do avatar deve apontar para `assets/images/imagem-avatar.jpeg`.

### 🧪 Executar Teste
- Executar o comando `npx tsc --noEmit` no terminal para garantir que o compilador do TypeScript valide as tipagens do `initialData.ts` contra o schema do `index.ts` sem apontar erros de propriedades ausentes.

### 🔍 Auto-Review
- Todos os campos obrigatórios definidos nas interfaces de `types` foram devidamente preenchidos na estrutura do `INITIAL_BIOLINK_DATA`?
- O contador `clicksCount` de todos os links iniciais foi inicializado explicitamente com o valor `0`?

### 📦 Handoff
Esta tarefa estará concluída quando a pasta `src/types/` e `src/data/` contiverem os arquivos indexados com tipagem 100% validadas pelo TypeScript.

---

## 🧠 TASK 3: Desenvolvimento do Backend Serverless (Hono API)

### 📝 Tarefa
Desenvolver o servidor backend serverless dentro do ecossistema do Worker utilizando o framework Hono para expor as rotas de API e realizar a persistência global e atômica diretamente no Cloudflare KV.

1. **Escrever o arquivo `src/index.ts`** inicializando a instância do Hono com o middleware de CORS ativado para qualquer origem (`*`).
2. **Implementar a rota `GET /api/profile`:** Tenta buscar a chave `"biolink_data"` do `c.env.BIOLINK_DB`. Se o valor retornado for nulo, importa e responde com o JSON de `initialData.ts`.
3. **Implementar a rota `POST /api/links/:id/click`:** Captura o parâmetro ID, extrai o JSON atual do KV, localiza o card correto, incrementa a propriedade `clicksCount` em mais um (`+1`) e grava a estrutura inteira atualizada de volta no KV de forma assíncrona.
4. **Implementar as rotas de autenticação (`POST /api/auth/login` e `GET /api/auth/me`):** O login deve validar as credenciais em texto contra as variáveis secretas de ambiente do Worker (`c.env.ADMIN_EMAIL` e `c.env.ADMIN_PASSWORD`) e retornar um token de autenticação em string.

### 🧪 Executar Teste
- Iniciar o servidor de desenvolvimento local da Cloudflare executando `npx wrangler dev`.
- Realizar uma requisição de teste utilizando uma ferramenta de API (como Postman ou cURL) para `GET http://localhost:8787/api/profile` e verificar se a carga de dados JSON é devolvida com o cabeçalho `Content-Type: application/json`.

### 🔍 Auto-Review
- O código do backend está livre de importações de arquivos locais como `fs` ou variáveis do Node como `process.env`? (Tudo deve vir de `c.env`).
- As rotas que alteram dados executam o método `await c.env.BIOLINK_DB.put(...)` para garantir que o dado foi de fato gravado na nuvem antes de responder ao cliente?

### 📦 Handoff
Esta tarefa estará concluída quando o arquivo `src/index.ts` estiver pronto, rodando sem crashes no ambiente de simulação do Wrangler e respondendo corretamente aos métodos HTTP planejados.

---

## 🎨 TASK 4: Interface do Usuário e Design System Cyberpunk (Frontend)

### 📝 Tarefa
Construir a camada visual responsiva do Biolink focada na experiência mobile (estilo web app) aplicando estritamente a paleta de cores escura e os efeitos visuais neon descritos no Design System.

1. **Configurar os estilos globais do Tailwind v4** importando os tokens de cores: Background (`#0F0C1B`), Surfaces (`#161224`) e os gradientes do Neon Violet (`#D946EF`) ao Electric Blue (`#3B82F6`).
2. **Criar o componente `src/components/PublicBiolink.tsx`:** Renderizar o topo (Avatar circular envolto em anel neon, nome com selo azul de verificado, cargo e biografia), a linha horizontal de redes sociais com ícones do `lucide-react` e a lista de links.
3. **Aplicar as regras do Design System nos Cards:** O card configurado como `isFeatured: true` deve receber preenchimento total do gradiente linear em 135 graus. Os secundários devem possuir fundo transparente com efeito Glassmorphism (`backdrop-blur-md` e opacidade).
4. **Acoplar o trigger de métricas:** Configurar o evento de clique (`onClick`) nos botões de link para disparar um disparo de telemetria em segundo plano via `fetch('/api/links/ID_DO_LINK/click', { method: 'POST' })` sem prender ou bloquear a navegação do usuário para a URL externa.
5. **Criar o componente `src/components/AdminLogin.tsx`:** Montar o formulário básico de autenticação mantendo o padrão escuro e futurista da interface.

### 🧪 Executar Teste
- Abrir o ambiente local e redimensionar a tela para a largura de um smartphone (`375px` a `425px`). Garantir que os elementos se alinhem de forma empilhada centralizada e que não ocorram quebras de layout ou transbordamento horizontal de página.
- Verificar na aba *Network* (Rede) do inspetor de elementos se o clique em um link dispara a requisição de clique com sucesso.

### 🔍 Auto-Review
- O efeito de desfoque de fundo (Glassmorphism) foi aplicado corretamente com propriedades compatíveis com os navegadores mobiles?
- O container principal possui uma limitação de largura máxima de tela (ex: `max-w-md` ou `max-w-[480px]`) centralizada para manter o visual elegante quando aberto em computadores desktop?

### 📦 Handoff
Esta tarefa estará concluída quando os componentes `PublicBiolink` e `AdminLogin` estiverem estilizados, integrados às chamadas de leitura de API e renderizando de forma idêntica às especificações do Design System.

---

## 🛠️ TASK 5: Painel Administrativo de Controle e Sincronização Global

### 📝 Tarefa
Desenvolver o Dashboard administrativo seguro para permitir a manipulação total do Biolink em tempo real e orquestrar o controle de estado e roteamento no arquivo central do front-end.

1. **Criar o componente `src/components/AdminDashboard.tsx`:** Interface contendo os inputs para alteração de textos do perfil, gerenciamento do grid de links de redes sociais e a lista interativa de cards para manipulação de títulos, adição de novos caminhos e alternação rápida de qual card detém o destaque principal.
2. **Integrar os payloads de gravação:** Conectar o botão principal de salvar do painel para compilar os dados modificados do estado e disparar uma requisição HTTP única do tipo `PUT` enviando a carga completa para a API do Worker, incluindo obrigatoriamente o token de autenticação Bearer recuperado no cabeçalho.
3. **Escrever o arquivo central `src/App.tsx`:** Implementar o gerenciador de rotas e o ciclo de vida inicial. Ao carregar a página, consulta a rota pública `/api/profile`. Se o usuário navegar para `/admin`, faz a checagem no `localStorage` pelo token ativo para decidir se exibe a tela de login ou libera a visualização do painel administrativo de controle.

### 🧪 Executar Teste
- Logar no painel administrativo local, realizar alterações na biografia, trocar a ordem de exibição de um card e clicar em "Salvar".
- Abrir uma janela anônima paralela no navegador e checar se o visual público do Biolink reflete imediatamente as mudanças recém-salvas sem exigir uma atualização forçada de cache de disco.

### 🔍 Auto-Review
- O front-end bloqueia a exibição do painel se o token não existir ou for inválido, redirecionando o usuário de volta para a tela de `/admin`?
