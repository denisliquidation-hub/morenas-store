/*
 * Gera 3 posts de feed (1080x1350) + 3 stories (1080x1920) coerentes
 * com a identidade visual da Morenas Store.
 *
 * Saída: imagens/social/feed-01.png, feed-02.png, feed-03.png,
 *         story-01.png, story-02.png, story-03.png
 *
 * Uso: node scripts/build-social.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'imagens', 'social');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ============== TOKENS ==============
const C = {
  bgFrom: '#faf8f5',
  bgMid: '#f6f2ec',
  bgTo: '#efe7dc',
  ink: '#181210',
  inkSoft: '#46352e',
  inkMuted: '#7a665b',
  brand: '#187e4f',
  brandDeep: '#116d42',
  brandLight: '#00c066',
  cream: '#ece1d2',
  dark: '#181210',
  glowBrand: '#198653',
  glowPurple: '#2f9e8f',
};

const FONT_SERIF = "Georgia, 'Times New Roman', serif";
const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// ============== SHARED HELPERS ==============
function defs(w, h) {
  return `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${C.bgFrom}"/>
        <stop offset="55%" stop-color="${C.bgMid}"/>
        <stop offset="100%" stop-color="${C.bgTo}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${C.glowBrand}" stop-opacity="0.55"/>
        <stop offset="45%" stop-color="${C.glowBrand}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${C.glowBrand}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${C.glowPurple}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${C.glowPurple}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.2" fill="#5e3e3e" fill-opacity="0.14"/>
      </pattern>
    </defs>
  `;
}

function frame(w, h, padding = 36) {
  return `
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <rect x="${padding}" y="${padding}" width="${w - padding * 2}" height="${h - padding * 2}"
          fill="none" stroke="${C.ink}" stroke-opacity="0.10" stroke-width="1"/>
  `;
}

// Selo redondo com número grande
function seal(cx, cy, r, numero) {
  return `
    <g transform="translate(${cx}, ${cy})">
      <circle cx="0" cy="0" r="${r + 17}" fill="none" stroke="${C.ink}" stroke-opacity="0.12" stroke-width="1"/>
      <circle cx="0" cy="0" r="${r}" fill="${C.dark}"/>
      <text x="0" y="${-r * 0.16}" text-anchor="middle" font-family="${FONT_SERIF}"
            font-style="italic" font-size="${r * 0.20}" fill="${C.cream}">capítulo</text>
      <text x="0" y="${r * 0.32}" text-anchor="middle" font-family="${FONT_SERIF}"
            font-size="${r * 0.86}" font-weight="900" fill="${C.brandLight}" letter-spacing="-2">${numero}</text>
      <text x="0" y="${r * 0.58}" text-anchor="middle" font-family="${FONT_SANS}"
            font-size="${r * 0.10}" font-weight="700" letter-spacing="4" fill="#bda795">DE TRÊS</text>
      <circle cx="0" cy="0" r="${r + 30}" fill="none"
              stroke="${C.glowBrand}" stroke-opacity="0.35" stroke-width="1" stroke-dasharray="2 6"/>
    </g>
  `;
}

// Pulse dot
function pulseDot(x, y, size = 9) {
  return `
    <g transform="translate(${x}, ${y})">
      <circle cx="0" cy="0" r="${size}" fill="${C.glowBrand}"/>
      <circle cx="0" cy="0" r="${size + 11}" fill="none" stroke="${C.glowBrand}" stroke-opacity="0.4"/>
    </g>
  `;
}

// Linha + eyebrow
function eyebrow(x, y, text, size = 14) {
  return `
    <g transform="translate(${x}, ${y})">
      <line x1="0" y1="0" x2="34" y2="0" stroke="${C.brand}" stroke-width="2"/>
      <text x="48" y="${size * 0.4}" font-family="${FONT_SANS}" font-size="${size}"
            font-weight="700" letter-spacing="4" fill="${C.brandDeep}">${text}</text>
    </g>
  `;
}

function wordmark(x, y, size = 38) {
  return `
    <text x="${x}" y="${y}" font-family="${FONT_SERIF}" font-size="${size}"
          font-weight="700" font-style="italic" fill="${C.ink}" letter-spacing="-0.5">
      Morenas Store
    </text>
  `;
}

function footer(x, y, extra = '') {
  return `
    <g transform="translate(${x}, ${y})">
      <text x="0" y="0" font-family="${FONT_SANS}" font-size="14" font-weight="700"
            letter-spacing="2.5" fill="${C.inkSoft}">MORENASSTORE.COM</text>
      <text x="220" y="0" font-family="${FONT_SANS}" font-size="14"
            letter-spacing="2.5" fill="${C.inkMuted}">·  IMPERATRIZ — MA</text>
      ${extra ? `<text x="0" y="26" font-family="${FONT_SANS}" font-size="12"
            letter-spacing="2" fill="${C.inkMuted}">${extra}</text>` : ''}
    </g>
  `;
}

// ============== FEED (1080 x 1350) ==============
function feedSvg({ numero, eyebrowText, line1, line2, sub }) {
  const W = 1080, H = 1350;
  const maxLen = Math.max(line1.length, line2.length);
  const titleSize = maxLen <= 9 ? 130 : (maxLen <= 13 ? 108 : 92);
  const lineGap = titleSize + 8;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${defs(W, H)}
  ${frame(W, H, 40)}
  <rect x="0" y="${H - 200}" width="320" height="200" fill="url(#dots)" opacity="0.9"/>

  <circle cx="${W * 0.78}" cy="${H * 0.18}" r="420" fill="url(#glow)"/>
  <circle cx="${W * 0.18}" cy="${H * 0.78}" r="320" fill="url(#glow2)"/>

  <!-- Top eyebrow -->
  ${eyebrow(80, 130, eyebrowText, 15)}

  <!-- Wordmark -->
  ${wordmark(80, 215, 44)}

  <!-- Title gigante (adaptativo) -->
  <text x="80" y="510" font-family="${FONT_SERIF}" font-size="${titleSize}" font-weight="900"
        fill="${C.ink}" letter-spacing="-3">${line1}</text>
  <text x="80" y="${510 + lineGap}" font-family="${FONT_SERIF}" font-size="${titleSize}" font-weight="900"
        font-style="italic" fill="${C.brand}" letter-spacing="-3">${line2}</text>

  <!-- Sub -->
  <text x="80" y="${510 + lineGap + 120}" font-family="${FONT_SERIF}" font-size="32" font-style="italic"
        fill="${C.inkSoft}">${sub}</text>

  <!-- Pulse dot -->
  ${pulseDot(80, 510 + lineGap + 200, 9)}
  <text x="110" y="${510 + lineGap + 206}" font-family="${FONT_SANS}" font-size="14" font-weight="700"
        letter-spacing="4" fill="${C.brandDeep}">EM BREVE</text>

  <!-- Selo -->
  ${seal(W - 280, H - 360, 165, numero)}

  <!-- Footer -->
  ${footer(80, H - 110, '@morenasstore')}
</svg>`;
}

// ============== STORY (1080 x 1920) ==============
function storySvg({ numero, eyebrowText, line1, line2, sub, cta }) {
  const W = 1080, H = 1920;
  // Tamanho adaptativo: textos longos diminuem
  const maxLen = Math.max(line1.length, line2.length);
  const titleSize = maxLen <= 9 ? 148 : (maxLen <= 13 ? 124 : 108);
  const lineGap = titleSize + 20;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${defs(W, H)}
  ${frame(W, H, 44)}
  <rect x="0" y="${H - 260}" width="380" height="260" fill="url(#dots)" opacity="0.9"/>

  <circle cx="${W * 0.82}" cy="${H * 0.15}" r="500" fill="url(#glow)"/>
  <circle cx="${W * 0.18}" cy="${H * 0.82}" r="380" fill="url(#glow2)"/>

  <!-- Top eyebrow -->
  ${eyebrow(90, 230, eyebrowText, 17)}

  <!-- Wordmark -->
  ${wordmark(90, 320, 46)}

  <!-- Selo (no canto direito mais alto) -->
  ${seal(W - 220, 320, 110, numero)}

  <!-- Title gigante (adaptativo) -->
  <text x="90" y="800" font-family="${FONT_SERIF}" font-size="${titleSize}" font-weight="900"
        fill="${C.ink}" letter-spacing="-4">${line1}</text>
  <text x="90" y="${800 + lineGap}" font-family="${FONT_SERIF}" font-size="${titleSize}" font-weight="900"
        font-style="italic" fill="${C.brand}" letter-spacing="-4">${line2}</text>

  <!-- Sub -->
  <text x="90" y="${800 + lineGap + 140}" font-family="${FONT_SERIF}" font-size="38" font-style="italic"
        fill="${C.inkSoft}">${sub}</text>

  <!-- CTA Box -->
  <g transform="translate(90, 1400)">
    <rect x="0" y="0" width="900" height="140" rx="70" fill="${C.dark}"/>
    <text x="450" y="88" text-anchor="middle" font-family="${FONT_SANS}"
          font-size="34" font-weight="700" fill="${C.cream}" letter-spacing="0.5">${cta}</text>
  </g>

  <!-- Link hint -->
  <text x="${W / 2}" y="1610" text-anchor="middle" font-family="${FONT_SANS}"
        font-size="22" font-weight="700" letter-spacing="3" fill="${C.inkSoft}">
    LINK NA BIO  ·  MORENASSTORE.COM
  </text>

  <!-- Pulse dot -->
  ${pulseDot(W / 2, 1670, 10)}

  <!-- Footer -->
  <text x="${W / 2}" y="1820" text-anchor="middle" font-family="${FONT_SANS}"
        font-size="20" letter-spacing="3" fill="${C.inkMuted}">
    @MORENASSTORE  ·  IMPERATRIZ — MA
  </text>
</svg>`;
}

// ============== CONTEÚDO DOS 3 ATOS ==============
const ATOS = [
  {
    numero: '01',
    eyebrowText: 'PRIMEIRO ATO · ESTREIA',
    line1: 'O site',
    line2: 'tá no ar.',
    sub: 'Morenas Store agora tem casa nova.',
    cta: 'CONHECER A LOJA',
  },
  {
    numero: '02',
    eyebrowText: 'SEGUNDO ATO · COLEÇÃO 02',
    line1: 'Novidades',
    line2: 'em breve.',
    sub: 'A nova coleção tá quase no ar.',
    cta: 'VER OS PRIMEIROS MODELOS',
  },
  {
    numero: '03',
    eyebrowText: 'TERCEIRO ATO · LISTA VIP',
    line1: 'Seja a primeira',
    line2: 'a saber.',
    sub: 'Acesso antecipado pra Lista Morenas.',
    cta: 'QUERO SER AVISADA',
  },
];

// ============== RENDER ==============
async function render(svg, outPath, w, h) {
  await sharp(Buffer.from(svg))
    .resize(w, h)
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(outPath);
  console.log('OK ->', outPath);
}

(async () => {
  for (let i = 0; i < ATOS.length; i++) {
    const ato = ATOS[i];
    const n = String(i + 1).padStart(2, '0');

    const feed = feedSvg(ato);
    await render(feed, path.join(OUT_DIR, `feed-${n}.png`), 1080, 1350);

    const story = storySvg(ato);
    await render(story, path.join(OUT_DIR, `story-${n}.png`), 1080, 1920);
  }
  console.log('\n✓ 6 imagens geradas em imagens/social/');
})();
