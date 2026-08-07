# PRD - Cyberpunk Biolink (Versão Cloudflare Serveless)

## 1. Visão Geral do Produto
O produto é um Biolink pessoal e profissional com um Painel Administrativo integrado para o usuário Rafa Franco. A aplicação deve ser hospedada de forma unificada na Cloudflare, utilizando infraestrutura escalável que garanta carregamento instantâneo, segurança contra acessos não autorizados e persistência global de dados.

## 2. Objetivos Principais
- Fornecer um carregamento abaixo de 200ms (TTFB ideal) para a rota pública.
- Permitir edição de links, biografia e redes sociais em tempo real via ambiente web.
- Garantir persistência de dados em toda a rede global da Cloudflare (eliminando problemas de cache desencontrado entre navegadores).

## 3. Requisitos de Telas e Fluxos

### Rota Pública (`/`)
- Exibição de avatar, nome (@rafafranco.ia), cargo, bio e ícones sociais rápidos.
- Lista de cards com suporte a um "Card de Destaque" (gradiente total) e "Cards Secundários" (Glassmorphism).
- Contador de cliques: Toda vez que um link for clicado, uma requisição em segundo plano deve registrar a métrica de forma assíncrona.

### Rota de Autenticação (`/admin`)
- Tela de login limpa contendo campos para Email e Senha.
- Bloqueio completo via JWT/Token gerado pelo Worker.

### Rota do Painel (`/admin/dashboard`)
- Tela protegida que consome as APIs seguras do Worker.
- CRUD Completo dos dados do perfil e gerenciamento posicional da ordenação dos cards.

## 4. Requisitos Não-Funcionais
- **Arquitetura Stateful Descentralizada:** Proibido o uso de sistema de arquivos local (`fs`). Toda gravação precisa ser feita no Cloudflare KV.
- **Single Page Application (SPA):** Roteamento cliente via React Router ou similar nativo para navegação fluida sem recarregamento de página.
