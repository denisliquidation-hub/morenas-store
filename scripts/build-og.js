/*
 * Gera imagens/og-image.png (1200x630) a partir de um SVG inline.
 * Usa fontes do sistema (Georgia, Helvetica) — sharp/librsvg não carrega @import de Google Fonts.
 *
 * Uso: node scripts/build-og.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const W = 1200;
const H = 630;

const SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#faf8f5"/>
      <stop offset="55%" stop-color="#f6f2ec"/>
      <stop offset="100%" stop-color="#efe7dc"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e63d7a" stop-opacity="0.50"/>
      <stop offset="45%" stop-color="#d92f6e" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#d92f6e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a64dbf" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#a64dbf" stop-opacity="0"/>
    </radialGradient>
    <pattern id="dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.2" fill="#5e3e3e" fill-opacity="0.14"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="430" width="320" height="200" fill="url(#dots)" opacity="0.9"/>
  <circle cx="990" cy="160" r="380" fill="url(#glow)"/>
  <circle cx="180" cy="540" r="280" fill="url(#glow2)"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#2a221e" stroke-opacity="0.10" stroke-width="1"/>

  <!-- Top eyebrow -->
  <g transform="translate(80, 98)">
    <line x1="0" y1="0" x2="34" y2="0" stroke="#cf2867" stroke-width="2"/>
    <text x="48" y="6" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="4" fill="#b51d57">COLEÇÃO 02 · LANÇAMENTO</text>
  </g>

  <!-- Wordmark -->
  <g transform="translate(80, 180)">
    <text x="0" y="0" font-family="Georgia, 'Times New Roman', serif" font-size="58" font-weight="700" font-style="italic" fill="#1f1612" letter-spacing="-0.5">Morenas Store</text>
  </g>

  <!-- Title gigante (linha 1) -->
  <g transform="translate(80, 290)">
    <text x="0" y="0" font-family="Georgia, 'Times New Roman', serif" font-size="118" font-weight="900" fill="#181210" letter-spacing="-3">Novidades</text>
  </g>
  <!-- Title gigante (linha 2 — italic rosa) -->
  <g transform="translate(80, 412)">
    <text x="0" y="0" font-family="Georgia, 'Times New Roman', serif" font-size="118" font-weight="900" font-style="italic" fill="#cf2867" letter-spacing="-3">em breve.</text>
  </g>

  <!-- Tagline -->
  <g transform="translate(80, 510)">
    <text x="0" y="0" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-style="italic" fill="#46352e">Sempre com o melhor da moda aos seus pés.</text>
  </g>

  <!-- Footer (domínio + cidade) -->
  <g transform="translate(80, 570)">
    <text x="0" y="0" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="2.5" fill="#4c3e36">MORENASSTORE.COM</text>
    <text x="220" y="0" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="14" font-weight="400" letter-spacing="2.5" fill="#7a665b">·  IMPERATRIZ — MA</text>
  </g>

  <!-- Selo circular -->
  <g transform="translate(960, 320)">
    <circle cx="0" cy="0" r="135" fill="none" stroke="#1f1612" stroke-opacity="0.12" stroke-width="1"/>
    <circle cx="0" cy="0" r="118" fill="#181210"/>
    <text x="0" y="-18" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="22" fill="#ece1d2">coleção</text>
    <text x="0" y="22" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="900" fill="#ff7da4" letter-spacing="-2">02</text>
    <text x="0" y="56" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="4" fill="#bda795">EM BREVE</text>
    <circle cx="0" cy="0" r="148" fill="none" stroke="#d92f6e" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="2 6"/>
  </g>

  <!-- Dot sinaleiro -->
  <g transform="translate(720, 408)">
    <circle cx="0" cy="0" r="9" fill="#d92f6e"/>
    <circle cx="0" cy="0" r="20" fill="none" stroke="#d92f6e" stroke-opacity="0.4"/>
  </g>
</svg>`;

const out = path.join(__dirname, '..', 'imagens', 'og-image.png');

sharp(Buffer.from(SVG))
  .resize(W, H)
  .png({ quality: 95, compressionLevel: 9 })
  .toFile(out)
  .then((info) => {
    console.log('OK ->', out);
    console.log(info);
  })
  .catch((err) => {
    console.error('ERR', err);
    process.exit(1);
  });
