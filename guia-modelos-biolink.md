# 🤖 Guia de Alocação de Modelos e Otimização de Custo (Biolink v2)

Este documento dita a estratégia de engenharia para o uso do seu Squad de IA. O objetivo é alcançar eficiência máxima na entrega do código gastando o mínimo de tokens possível, aproveitando a taxa de cache e o custo por sessão da sua plataforma.

---

## 📊 Matriz de Custo e Papéis dos Modelos

| Modelo | Custo da Sessão | Taxa de Cache | Papel Principal no Projeto |
| :--- | :--- | :--- | :--- |
| **Qwen3.7 Plus** | \$1.69 | Média / Alta | Arquitetura, Setup e Roteamento Complexo |
| **DeepSeek V4 Flash** | \$0.28 | **97%** | Geração de Código em Massa, HTML e Tailwind v4 |
| **DeepSeek V4 Pro** | \$3.48 | **97%** | Code Review, Segurança e Debugging de Erros |

---

## 🛠️ Alocação de Modelos por Task

### 🚀 TASK 1: Inicialização do Projeto e Configuração da Infraestrutura
*   **Modelo Executor:** `Qwen3.7 Plus` (\$1.69)
*   **Por que este modelo?** Configurar os arquivos maestros do ecossistema Cloudflare (`wrangler.toml`, `vite.config.ts`, `package.json`) exige uma IA com excelente visão sistêmica e entendimento de infraestrutura moderna. O Qwen3.7 Plus entrega essa capacidade analítica sem o custo proibitivo de \$15.00 do Kimi K3.
*   **Ação:** Fornecer a especificação técnica da Task 1 e pedir a geração limpa de todas as configurações de ambiente.

### ⚙️ TASK 2: Camada de Tipagem e Dados Iniciais (Data & Types)
*   **Modelo Executor:** `DeepSeek V4 Flash (New)` (\$0.28)
*   **Por que este modelo?** Mapear schemas de TypeScript (`index.ts`) e preencher objetos de mock estáticos (`initialData.ts`) são tarefas de digitação mecânica e estruturação de texto. O Flash executa isso com velocidade instantânea e custo quase nulo.
*   **Ação:** Alimentar o chat do Flash com os arquivos da Task 1 e pedir a codificação dos schemas e dados semente.

### 🧠 TASK 3: Desenvolvimento do Backend Serverless (Hono API no Worker)
*   **Modelo Executor:** `DeepSeek V4 Flash (New)` (\$0.28)
*   **Por que este modelo?** Escrever rotas básicas de API (GET, POST, PUT) usando o framework Hono e persistência em KV é um padrão repetitivo bem mapeado pelo modelo Flash. Ele gerará o código limpo sem estourar o orçamento de tokens.
*   **Ação:** Pedir ao Flash para programar o `src/index.ts` contendo as rotas de perfil, cliques e sessão administrativa.

### 🎨 TASK 4: Interface do Usuário e Design System Cyberpunk (Frontend)
*   **Modelo Executor:** `DeepSeek V4 Flash (New)` (\$0.28)
*   **Por que este modelo?** Componentes de interface React geram arquivos longos por conta das classes de estilização do Tailwind. Utilizar um modelo de \$4.00 (como o Kimi K2.7) aqui seria um desperdício. O Flash, com sua taxa de cache de 97%, permite que você altere pequenos detalhes do visual cyberpunk repetidamente cobrando apenas frações de centavos por iteração.
*   **Ação:** Fornecer as especificações visuais do Design System e pedir a criação dos componentes `PublicBiolink.tsx` e `AdminLogin.tsx`.

### 🛠️ TASK 5: Painel Administrativo de Controle e Sincronização Global
*   **Modelo Executor:** `Qwen3.7 Plus` (\$1.69) para o esqueleto / `DeepSeek V4 Flash` (\$0.28) para preenchimento.
*   **Por que estes modelos?** A orquestração de estado global no `App.tsx` (sincronizar tokens de autenticação, travar rotas privadas se o usuário não estiver logado e lidar com o ciclo de vida do React) exige raciocínio lógico apurado. 
*   **Ação:** Use o Qwen3.7 Plus para estruturar a árvore de roteamento e segurança do `App.tsx`. Depois, passe o código gerado para o Flash terminar de implementar os formulários do painel admin.

---

## 🛡️ Etapa Transversal: Auto-Review e Debugging de Erros
*   **Modelo Único:** `DeepSeek V4 Pro` (\$3.48)
*   **Quando acionar:** Exclusivamente no final de cada Task ou se o terminal disparar um erro de compilação/deploy insolúvel.
*   **Estratégia de Token:** Abra um chat dedicado com o DeepSeek V4 Pro. Conforme você avança nas Tasks, vá jogando os códigos prontos nele apenas para revisão. Graças à **taxa de cache de 97%**, o Pro lerá o histórico das rodadas passadas quase de graça, cobrando caro apenas pelos novos trechos inseridos para análise.
*   **Prompt de Entrada:** *"Atue como auditor de código. Analise o arquivo gerado abaixo em busca de falhas de segurança na rota admin, vazamento de memória ou caminhos que possam gerar erros de tela em branco na Cloudflare."*
