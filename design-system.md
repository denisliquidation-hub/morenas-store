# Morenas Store — Design System

> Loja de calçados femininos. Tom: **fashion editorial** — preto e branco como base sólida e silenciosa, pink como statement de marca. Nada de pink Barbie genérico ou neon SaaS.

---

## 1. Direção Visual

**Personalidade:** Elegância com atitude. Confiança feminina sem ser delicada demais.

**Pairing tipográfico:** Serif editorial (Playfair Display) para títulos + sans-serif neutra (Inter) para corpo. Pairing clássico fashion (Vogue, Net-a-Porter, Schutz).

**Densidade:** Generosa. Muito whitespace. Produtos respiram. Tipografia grande.

**Hierarquia de cor:**
- Preto domina (texto, navegação, footer)
- Branco/off-white domina superfícies
- Pink aparece em ações, destaques editoriais e momentos de marca — **nunca em tudo**

---

## 2. Cores

### Tokens semânticos — Light mode (padrão)

```
text-primary       hsl(0 0% 8%)        Quase preto. Títulos e corpo.
text-secondary     hsl(0 0% 35%)       Subtítulos, descrição.
text-muted         hsl(0 0% 55%)       Captions, metadados.
text-on-dark       hsl(0 0% 98%)       Texto em superfície escura.
text-on-accent     hsl(0 0% 100%)      Texto em botão pink.

surface-page       hsl(30 10% 98%)     Off-white quente (warm white).
surface-card       hsl(0 0% 100%)      Cards, produtos.
surface-elevated   hsl(0 0% 100%)      Modal, dropdown.
surface-inverse    hsl(0 0% 8%)        Footer, blocos editoriais.
surface-muted      hsl(30 8% 95%)      Seção alternada, skeletons.

action-primary     hsl(335 75% 48%)    Pink fashion — magenta profundo.
action-primary-hover hsl(335 80% 42%)
action-secondary   hsl(0 0% 8%)        CTA preto (carrinho, checkout).
action-secondary-hover hsl(0 0% 20%)
action-ghost-hover hsl(30 10% 94%)

border-default     hsl(0 0% 88%)       Card, input.
border-subtle      hsl(0 0% 93%)       Separadores.
border-strong      hsl(0 0% 8%)        Inputs focados em formulário editorial.
border-focus       hsl(335 75% 48%)    Ring de foco — pink.

status-success     hsl(150 45% 38%)
status-warning     hsl(35 90% 50%)
status-error       hsl(0 72% 50%)
status-info        hsl(210 70% 50%)
```

### Tokens semânticos — Dark mode

```
text-primary       hsl(0 0% 96%)
text-secondary     hsl(0 0% 72%)
text-muted         hsl(0 0% 52%)

surface-page       hsl(0 0% 6%)
surface-card       hsl(0 0% 9%)
surface-elevated   hsl(0 0% 12%)
surface-inverse    hsl(0 0% 98%)
surface-muted      hsl(0 0% 11%)

action-primary     hsl(335 80% 58%)    Levemente clareado pra contraste.
action-primary-hover hsl(335 85% 64%)
action-secondary   hsl(0 0% 96%)
action-secondary-hover hsl(0 0% 85%)
action-ghost-hover hsla(0 0% 100% / 0.06)

border-default     hsla(0 0% 100% / 0.1)
border-subtle      hsla(0 0% 100% / 0.06)
border-strong      hsl(0 0% 96%)
border-focus       hsl(335 80% 58%)
```

### Escala de pink (uso editorial)

```
pink-50    hsl(335 80% 97%)    Background sutil de seção.
pink-100   hsl(335 75% 92%)    Tag, badge soft.
pink-300   hsl(335 75% 75%)    Ilustração, ícone.
pink-500   hsl(335 75% 48%)    Cor de marca canônica.
pink-700   hsl(335 80% 38%)    Hover profundo.
pink-900   hsl(335 70% 22%)    Texto sobre pink-50.
```

**Quando usar pink:**
- CTA primário (Comprar, Adicionar ao carrinho — opcional, alterna com preto)
- Tags de coleção (NEW, SALE)
- Underline editorial em links de marca
- Borda esquerda de quote/destaque
- Ícone de favorito ativo

**Quando NÃO usar pink:**
- Texto corrido
- Fundo de página inteira
- Borda padrão de card
- Gradientes (anti-pattern)

---

## 3. Tipografia

### Famílias

```
font-display    "Playfair Display", Georgia, serif       Hero, h1, h2.
font-body       "Inter", -apple-system, sans-serif        Corpo, UI.
font-mono       "JetBrains Mono", Menlo, monospace        Códigos, SKUs.
```

### Escala

```
text-xs       0.75rem    12px    line-height 1.4
text-sm       0.875rem   14px    line-height 1.5
text-base     1rem       16px    line-height 1.6
text-lg       1.125rem   18px    line-height 1.6
text-xl       1.25rem    20px    line-height 1.5
text-2xl      1.5rem     24px    line-height 1.4
text-3xl      1.875rem   30px    line-height 1.3
text-4xl      2.25rem    36px    line-height 1.2
text-5xl      3rem       48px    line-height 1.1
text-6xl      3.75rem    60px    line-height 1.05
text-display  5rem       80px    line-height 1.0
text-hero     6.5rem    104px    line-height 0.95
```

### Pesos

```
font-regular    400
font-medium     500
font-semibold   600
font-bold       700
font-black      900    Usado em display Playfair pra impacto editorial.
```

### Tracking (letter-spacing)

```
tracking-tight    -0.02em    Display, hero.
tracking-normal    0
tracking-wide      0.05em    Eyebrow, label.
tracking-wider     0.1em     Botão pequeno, badge.
tracking-widest    0.2em     "MORENAS STORE" wordmark.
```

### Regras de uso

- **h1/Hero:** Playfair Display, black (900), tracking-tight
- **h2/h3:** Playfair Display, bold (700)
- **Eyebrow ("New Collection"):** Inter, uppercase, tracking-widest, text-xs
- **Corpo:** Inter, regular, text-base
- **UI/Botão:** Inter, medium, tracking-wide
- **Preço:** Inter, semibold, tabular-nums

---

## 4. Espaçamento

Grid de 4px.

```
space-0     0
space-1     0.25rem    4px
space-2     0.5rem     8px
space-3     0.75rem    12px
space-4     1rem       16px
space-5     1.25rem    20px
space-6     1.5rem     24px
space-8     2rem       32px
space-10    2.5rem     40px
space-12    3rem       48px
space-16    4rem       64px
space-20    5rem       80px
space-24    6rem       96px
space-32    8rem       128px
space-40    10rem      160px
```

### Padrões

- **Padding de card:** space-6 (24px) interno
- **Gap entre produtos no grid:** space-8 desktop / space-4 mobile
- **Padding de seção:** space-24 vertical desktop / space-16 mobile
- **Padding de container:** space-8 lateral desktop / space-4 mobile
- **Max-width de container:** 1280px

---

## 5. Bordas e Raios

```
radius-none      0
radius-sm        2px      Tag, badge.
radius-md        4px      Input, botão padrão.
radius-lg        8px      Card, modal.
radius-xl        16px     Card hero, banner.
radius-2xl       24px     Bloco editorial.
radius-full      9999px   Pill, avatar, ícone redondo.
```

**Princípio:** raio moderado. Calçado é produto fashion — raio extremo (24px+) só em blocos grandes, nunca em botões. Botão pill (full) é OK pra ação secundária editorial.

---

## 6. Sombras

```
shadow-xs    0 1px 2px rgba(0, 0, 0, 0.04)
shadow-sm    0 2px 4px rgba(0, 0, 0, 0.06)
shadow-md    0 4px 12px rgba(0, 0, 0, 0.08)
shadow-lg    0 12px 32px rgba(0, 0, 0, 0.12)
shadow-xl    0 24px 64px rgba(0, 0, 0, 0.16)
shadow-product 0 16px 40px rgba(0, 0, 0, 0.10)   Imagem de produto em hover.
```

**Dark mode:** sombras quase invisíveis. Compensar com borda sutil (`border-subtle`) e diferença de luminosidade entre `surface-card` e `surface-elevated`.

---

## 7. Componentes

### Botão

**Primary (preto)**
- bg: `action-secondary` (preto)
- text: `text-on-dark`
- padding: 14px 28px
- font: Inter medium, text-sm, tracking-wide, uppercase
- radius: `radius-md`
- hover: `action-secondary-hover`

**Primary Pink (statement)**
- bg: `action-primary`
- text: `text-on-accent`
- mesmo formato do preto
- Uso: CTA editorial, coleção em destaque

**Secondary (outline)**
- bg: transparent
- border: 1px solid `border-strong`
- text: `text-primary`
- hover: bg `action-ghost-hover`

**Ghost**
- bg: transparent
- text: `text-primary`
- hover: bg `action-ghost-hover`, text underline

**Link editorial**
- text: `text-primary`
- underline pink (`pink-500`) 2px offset 4px
- hover: text vira `pink-500`

### Card de produto

- bg: `surface-card`
- border: nenhuma (apenas imagem)
- imagem: aspect-ratio 4/5 (calçado vertical)
- gap interno: space-3
- nome do produto: Inter semibold, text-base
- preço: Inter semibold, text-lg, tabular-nums
- preço riscado: Inter regular, text-sm, `text-muted`, line-through
- tag (NEW/SALE): pill, `pink-500` bg, branco text, tracking-widest, text-xs, uppercase
- hover: imagem com shadow-product, transição 300ms

### Input

- bg: `surface-card`
- border: 1px solid `border-default`
- radius: `radius-md`
- padding: 12px 16px
- font: Inter regular, text-base
- focus: border `border-focus` (pink), shadow ring 3px pink-50

### Badge / Tag

- Pill (`radius-full`)
- padding: 4px 12px
- text-xs, tracking-widest, uppercase, medium
- Variantes:
  - `solid-pink`: bg pink-500, text white
  - `solid-black`: bg preto, text white
  - `soft-pink`: bg pink-100, text pink-900
  - `outline`: border-default, text-primary

### Navegação

- Top bar fixa
- bg: `surface-page` com border-bottom sutil
- altura: 72px desktop / 56px mobile
- Logo central (Playfair, tracking-widest, uppercase)
- Links: Inter medium, text-sm, tracking-wide
- hover: underline pink 2px

---

## 8. Motion

```
duration-fast    150ms    Hover, click feedback.
duration-base    250ms    Padrão de transição.
duration-slow    400ms    Card hover, modal entry.
duration-editorial 600ms  Hero, carousel.

easing-base      cubic-bezier(0.4, 0, 0.2, 1)
easing-out       cubic-bezier(0, 0, 0.2, 1)
easing-editorial cubic-bezier(0.16, 1, 0.3, 1)    Easing fashion (acelera e descansa).
```

---

## 9. Iconografia

- Lucide Icons (linha fina)
- stroke-width: 1.5
- Tamanhos: 16 / 20 / 24 / 32 px
- Cor: herda do contexto (`currentColor`)
- Ícone de favorito (coração): pink-500 quando ativo, outline `text-muted` quando inativo

---

## 10. Anti-patterns evitados

- ❌ Gradiente pink→roxo neon (genérico SaaS)
- ❌ Pink em fundo de página inteira (vira Barbie)
- ❌ Border-radius 24px+ em botão (vira "fofo")
- ❌ Sombra colorida pink em tudo (glow neon)
- ❌ Ultra-saturação (`hsl(330 100% 60%)` — chiclete)
- ❌ Gradiente como cor de marca

**Onde pink brilha:**
- 1 CTA editorial por seção
- Underline em link de coleção
- Borda de destaque em quote
- Tag de "NEW"/"SALE"
- Ícone de favorito ativo
- Estado de foco em input
