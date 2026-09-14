/*
 * Home — renderiza produtos do banco nos grids "Destaques" e "Lançamento 02"
 */

import { supabase } from '/js/supabase-client.js';

const TAG_LABELS = {
  'novo': { label: 'Novo', cls: 'tag--brand' },
  'mais-vendido': { label: 'Mais vendido', cls: 'tag--black' },
  'edicao-limitada': { label: 'Edição limitada', cls: 'tag--soft' },
  'pre-venda': { label: 'Pré-venda', cls: 'tag--soft' },
  'lancamento-02': { label: 'Lançamento 02', cls: 'tag--brand' },
  'promocao': { label: 'Promoção', cls: 'tag--brand' },
  'exclusivo': { label: 'Exclusivo', cls: 'tag--black' },
};

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function renderCard(p, cat) {
  const tag = p.tag && TAG_LABELS[p.tag];
  const tagHtml = tag
    ? `<span class="tag ${tag.cls} product__tag">${escapeHtml(tag.label)}</span>`
    : '';

  const desejo = p.desejo
    ? `<p class="product__desire">${escapeHtml(p.desejo)}</p>`
    : '';

  const categoria = cat?.nome || (p.tag ? TAG_LABELS[p.tag].label : '—');
  const imgPos = p.imagem_position || 'center center';
  const imgUrl = p.imagem_url || '/imagens/logo.png';

  return `
    <article class="product">
      <a href="/produto.html?slug=${encodeURIComponent(p.slug)}" class="product__link" style="text-decoration: none; color: inherit">
        <div class="product__image-wrap">
          ${tagHtml}
          <button class="product__fav" aria-label="Favoritar" onclick="event.preventDefault(); event.stopPropagation();">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
          <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.nome)}" class="product__image" loading="lazy" style="object-position: ${escapeHtml(imgPos)}" />
        </div>
        <span class="product__category">${escapeHtml(categoria)}</span>
        <h3 class="product__name">${escapeHtml(p.nome)}</h3>
        ${desejo}
        <div class="product__price product__price--soon">
          <span class="product__soon">
            <span class="product__soon-dot"></span>
            Em breve
          </span>
        </div>
        <span class="product__cta">Ver detalhes</span>
      </a>
    </article>
  `;
}

function renderSkeleton(count = 4) {
  return Array.from({ length: count }, () => `
    <article class="product product--skeleton" aria-hidden="true">
      <div class="product__image-wrap" style="background: var(--surface-muted)"></div>
      <div style="height: 12px; background: var(--surface-muted); border-radius: 4px; margin-top: 12px; width: 40%"></div>
      <div style="height: 18px; background: var(--surface-muted); border-radius: 4px; margin-top: 8px; width: 80%"></div>
      <div style="height: 14px; background: var(--surface-muted); border-radius: 4px; margin-top: 8px; width: 60%"></div>
      <div style="height: 24px; background: var(--surface-muted); border-radius: 4px; margin-top: 12px; width: 50%"></div>
    </article>
  `).join('');
}

async function loadGrids() {
  const destaqueGrid = document.querySelector('[data-produtos="destaques"]');
  const lancamentoGrid = document.querySelector('[data-produtos="lancamento"]');

  if (destaqueGrid) destaqueGrid.innerHTML = renderSkeleton(4);
  if (lancamentoGrid) lancamentoGrid.innerHTML = renderSkeleton(3);

  // Busca categorias pra fazer lookup
  const { data: categorias } = await supabase
    .from('categorias').select('id, nome, slug');
  const catMap = new Map((categorias || []).map(c => [c.id, c]));

  // Destaques
  if (destaqueGrid) {
    const { data: destaques } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .eq('destaque_home', true)
      .order('created_at', { ascending: true })
      .limit(8);
    if (destaques?.length) {
      destaqueGrid.innerHTML = destaques.map(p => renderCard(p, catMap.get(p.categoria_id))).join('');
    } else {
      destaqueGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: var(--space-12)">Nenhum produto em destaque ainda.</p>';
    }
  }

  // Lançamento
  if (lancamentoGrid) {
    const { data: lancamentos } = await supabase
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .eq('lancamento', true)
      .order('created_at', { ascending: false })
      .limit(8);
    if (lancamentos?.length) {
      lancamentoGrid.innerHTML = lancamentos.map(p => renderCard(p, catMap.get(p.categoria_id))).join('');
    } else {
      lancamentoGrid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: var(--space-12)">Nenhum lançamento ativo no momento.</p>';
    }
  }
}

loadGrids().catch(err => {
  console.error('Erro ao carregar produtos:', err);
});
