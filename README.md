# Morenas Store

Site oficial — **Moda Feminina · Atacado e Varejo · Imperatriz - MA**.
Tagline: *"Sempre com o melhor da moda aos seus pés."*

## Stack

- HTML / CSS / JS vanilla (sem framework)
- Tokens de design centralizados em `styles/tokens.css`
- Dark mode com persistência via `localStorage`
- 100% português do Brasil

## Estrutura

```
morenas-store/
├── index.html              ← home da loja
├── design-system.html      ← preview do Design System (referência interna)
├── design-system.md        ← documentação dos tokens
├── styles/
│   ├── tokens.css          ← variáveis CSS (:root + .dark)
│   ├── base.css            ← reset + tipografia base
│   └── components.css      ← botões, tags, cards, nav, etc
├── imagens/                ← logo + fotos de produto
├── package.json            ← serve pra deploy
└── railway.json            ← config do Railway
```

## Rodar localmente

```bash
npm install
npm run dev
# abre em http://localhost:3000
```

Ou simplesmente abrir `index.html` no navegador (não precisa de servidor pra desenvolvimento).

## Deploy

Hospedado no **Railway** com deploy automático a cada push na branch `main`.

**Domínio:** [morenasstore.com](https://morenasstore.com)
**DNS:** Bluehost → Railway

### Como funciona

1. `git push origin main` dispara webhook do GitHub no Railway
2. Railway roda `npm install` e `npm start` (que executa `serve`)
3. Site fica disponível na URL do Railway + no domínio customizado
