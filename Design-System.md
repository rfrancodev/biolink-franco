# Design System Spec - Estética Cyberpunk Dark

## 1. Tokens de Cores
- **Background Principal:** `#0F0C1B` (Preto azulado profundo).
- **Surface Color (Cards):** `#161224` com opacidade aplicada de `60%` e efeito de desfoque (`backdrop-filter: blur(12px)`) para criar o visual Glassmorphism.
- **Borda de Efeito:** Vermelho/Roxo Neon transparente (`rgba(217, 70, 239, 0.15)`).
- **Gradients (Destaques/Avatar):** Linear gradiente de Roxo Neon (`#D946EF`) para Azul Elétrico (`#3B82F6`) em ângulo de 135 graus.
- **Typography Colors:**
  - Títulos e Destaques: `#FFFFFF` (Branco Puro).
  - Descrições e Apoio: `#9CA3AF` (Cinza Lavanda/Muted).

## 2. Componentes de Interface (UI Components)

### O Avatar
- **Dimensões:** `96x96px` centralizado.
- **Efeito Visual:** Envolto por uma tag `div` de espaçamento `4px` configurada com o gradiente da marca, criando o anel luminoso neon circular (`border-radius: 50%`).

### Cards de Link
- **Dimensões:** Largura máxima de `100%` limitado em container desktop de `480px`. Altura interna flexível com padding vertical de `16px`.
- **Efeitos Interativos (Hover):**
  - Card Secundário: Escalar ligeiramente (`scale-102`) e aumentar a intensidade da borda neon ao passar o mouse.
  - Card Principal: Efeito de pulso discreto na animação do gradiente de fundo.
- **Bordas:** `border-radius: 16px` rígido para manter consistência geométrica.
