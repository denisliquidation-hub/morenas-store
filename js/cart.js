/*
 * Cart — Morenas Store
 * Estado local em localStorage. API reativa via onChange().
 * Auto-monta badges em elementos com data-cart-badge.
 *
 * Estrutura de item:
 * { id, slug, nome, preco, preco_antigo?, imagem_url, imagem_position?,
 *   qty, max_estoque?, categoria_nome?, tamanho? }
 */

const STORAGE_KEY = 'morenas-cart-v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [], updated_at: null };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return { items: [], updated_at: null };
    return parsed;
  } catch {
    return { items: [], updated_at: null };
  }
}

function save(cart) {
  cart.updated_at = new Date().toISOString();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
  emit();
}

// ========== API pública ==========
export function getCart() { return load(); }

export function getCount() {
  return load().items.reduce((s, i) => s + (i.qty || 0), 0);
}

export function getSubtotal() {
  return load().items.reduce((s, i) => s + (i.qty || 0) * Number(i.preco || 0), 0);
}

export function add(item, qty = 1) {
  if (!item || !item.id) return;
  const cart = load();
  const key = itemKey(item);
  const existing = cart.items.find(i => itemKey(i) === key);
  const max = item.max_estoque ?? 999;
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, max);
    // sincroniza dados (preço, imagem podem ter mudado no banco)
    existing.preco = item.preco;
    existing.preco_antigo = item.preco_antigo ?? null;
    existing.imagem_url = item.imagem_url ?? existing.imagem_url;
    existing.imagem_position = item.imagem_position ?? existing.imagem_position;
    existing.max_estoque = max;
  } else {
    cart.items.push({
      id: item.id,
      slug: item.slug,
      nome: item.nome,
      preco: Number(item.preco),
      preco_antigo: item.preco_antigo ?? null,
      imagem_url: item.imagem_url ?? null,
      imagem_position: item.imagem_position ?? 'center center',
      categoria_nome: item.categoria_nome ?? null,
      tamanho: item.tamanho ?? null,
      max_estoque: max,
      qty: Math.min(qty, max),
    });
  }
  save(cart);
}

export function setQty(id, qty, tamanho = null) {
  const cart = load();
  const idx = cart.items.findIndex(i => i.id === id && (i.tamanho ?? null) === tamanho);
  if (idx === -1) return;
  if (qty <= 0) {
    cart.items.splice(idx, 1);
  } else {
    const max = cart.items[idx].max_estoque ?? 999;
    cart.items[idx].qty = Math.min(qty, max);
  }
  save(cart);
}

export function remove(id, tamanho = null) {
  const cart = load();
  cart.items = cart.items.filter(i => !(i.id === id && (i.tamanho ?? null) === tamanho));
  save(cart);
}

export function clear() {
  save({ items: [], updated_at: null });
}

// Gera mensagem WhatsApp do pedido
export function toWhatsappMessage({ nome, telefone, link } = {}) {
  const cart = load();
  if (!cart.items.length) return '';

  const linhas = ['Olá! Quero fechar o pedido na Morenas Store:', ''];
  cart.items.forEach(i => {
    const tam = i.tamanho ? ` · Tam ${i.tamanho}` : '';
    const sub = (i.qty * i.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    linhas.push(`• ${i.nome}${tam} (x${i.qty}) — R$ ${sub}`);
  });
  linhas.push('');
  linhas.push(`Subtotal: R$ ${getSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  if (nome) linhas.push(`Nome: ${nome}`);
  if (telefone) linhas.push(`WhatsApp: ${telefone}`);
  if (link) {
    linhas.push('');
    linhas.push(link);
  }
  return linhas.join('\n');
}

// ========== Event bus ==========
const listeners = new Set();
function emit() {
  const c = load();
  listeners.forEach(fn => { try { fn(c); } catch (e) { console.error(e); } });
}

export function onChange(fn) {
  listeners.add(fn);
  try { fn(load()); } catch (e) { console.error(e); }
  return () => listeners.delete(fn);
}

// Multi-tab sync
window.addEventListener('storage', e => {
  if (e.key === STORAGE_KEY) emit();
});

// ========== Auto-mount: badges no header ==========
function mountBadges() {
  document.querySelectorAll('[data-cart-badge]').forEach(el => {
    if (el.dataset.cartBadgeMounted) return;
    el.dataset.cartBadgeMounted = 'true';
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
    const badge = document.createElement('span');
    badge.className = 'cart-badge';
    badge.setAttribute('aria-label', 'itens no carrinho');
    el.appendChild(badge);
    onChange(cart => {
      const count = cart.items.reduce((s, i) => s + i.qty, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? '' : 'none';
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountBadges);
} else {
  mountBadges();
}

// ========== Util interno ==========
function itemKey(i) {
  return `${i.id}::${i.tamanho ?? ''}`;
}
