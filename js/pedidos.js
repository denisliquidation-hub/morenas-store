/*
 * Pedidos — helpers compartilhados Morenas Store
 * Status, labels, cores, criação de pedido a partir do carrinho.
 */

export const STATUS_LABELS = {
  'aguardando-confirmacao': 'Aguardando confirmação',
  'confirmado': 'Confirmado',
  'pago': 'Pago',
  'separando': 'Separando',
  'enviado': 'Enviado',
  'entregue': 'Entregue',
  'cancelado': 'Cancelado',
};

export const STATUS_ORDER = [
  'aguardando-confirmacao',
  'confirmado',
  'pago',
  'separando',
  'enviado',
  'entregue',
  'cancelado',
];

export const STATUS_COLORS = {
  'aguardando-confirmacao': { bg: 'hsla(35, 90%, 50%, 0.18)', fg: 'hsl(35, 90%, 55%)' },
  'confirmado':             { bg: 'hsla(220, 70%, 55%, 0.18)', fg: 'hsl(220, 75%, 65%)' },
  'pago':                   { bg: 'hsla(146, 64%, 42%, 0.20)', fg: 'hsl(146, 64%, 50%)' },
  'separando':              { bg: 'hsla(280, 60%, 60%, 0.18)', fg: 'hsl(280, 60%, 70%)' },
  'enviado':                { bg: 'hsla(200, 70%, 50%, 0.18)', fg: 'hsl(200, 75%, 60%)' },
  'entregue':               { bg: 'hsla(146, 64%, 42%, 0.30)', fg: 'hsl(146, 64%, 45%)' },
  'cancelado':              { bg: 'hsla(0, 72%, 50%, 0.18)',   fg: 'hsl(0, 72%, 60%)' },
};

export const FORMA_PAGAMENTO_LABELS = {
  pix: 'PIX',
  cartao: 'Cartão',
  whatsapp: 'Combinar no WhatsApp',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência',
};

export function fmtBRL(n) {
  return 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtData(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Normaliza telefone brasileiro pra digitos (pro wa.me)
export function telefoneParaWa(tel) {
  if (!tel) return '';
  const digits = String(tel).replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return '55' + digits;
  if (digits.length >= 12 && digits.startsWith('55')) return digits;
  return digits;
}

// Cria pedido + itens a partir do estado do carrinho.
// Retorna { pedido, error }.
export async function criarPedidoDoCarrinho(supabase, {
  cliente_id = null,
  cliente_nome,
  cliente_telefone,
  cliente_email = null,
  cliente_endereco = null,
  observacoes_cliente = null,
  items,
  subtotal,
  frete = null,
}) {
  if (!cliente_nome || !cliente_telefone) {
    return { pedido: null, error: new Error('Nome e telefone são obrigatórios.') };
  }
  if (!items || !items.length) {
    return { pedido: null, error: new Error('Carrinho vazio.') };
  }

  const total = Number(subtotal) + Number(frete || 0);

  // 1. Cria o pedido (numero_pedido é gerado pelo DEFAULT)
  const { data: pedido, error: errPedido } = await supabase
    .from('pedidos')
    .insert({
      cliente_id,
      cliente_nome: cliente_nome.trim(),
      cliente_telefone: cliente_telefone.trim(),
      cliente_email: cliente_email?.trim() || null,
      cliente_endereco,
      subtotal,
      frete,
      total,
      status: 'aguardando-confirmacao',
      observacoes_cliente: observacoes_cliente?.trim() || null,
    })
    .select('*')
    .single();

  if (errPedido) return { pedido: null, error: errPedido };

  // 2. Cria os itens
  const itensPayload = items.map(i => ({
    pedido_id: pedido.id,
    produto_id: i.id,
    produto_snapshot: {
      nome: i.nome,
      slug: i.slug,
      imagem_url: i.imagem_url,
      imagem_position: i.imagem_position,
      preco: i.preco,
      preco_antigo: i.preco_antigo,
      categoria_nome: i.categoria_nome,
    },
    tamanho: i.tamanho || null,
    quantidade: i.qty,
    preco_unitario: Number(i.preco),
  }));

  const { error: errItens } = await supabase
    .from('itens_pedido')
    .insert(itensPayload);

  if (errItens) {
    // rollback: deleta o pedido pra não ficar órfão
    await supabase.from('pedidos').delete().eq('id', pedido.id);
    return { pedido: null, error: errItens };
  }

  return { pedido, error: null };
}

// Marca whatsapp_message_sent_at agora (fire-and-forget — não bloqueia o redirect)
export function marcarWhatsappEnviado(supabase, pedidoId) {
  return supabase
    .from('pedidos')
    .update({ whatsapp_message_sent_at: new Date().toISOString() })
    .eq('id', pedidoId);
}

// Gera mensagem WhatsApp com base no pedido criado (inclui numero_pedido)
export function gerarMensagemWhatsapp(pedido, items, { link } = {}) {
  const linhas = [
    `Olá! Acabei de fechar o pedido ${pedido.numero_pedido} na Morenas Store:`,
    '',
  ];
  items.forEach(i => {
    const tam = i.tamanho ? ` · Tam ${i.tamanho}` : '';
    const sub = (i.qty * i.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    linhas.push(`• ${i.nome}${tam} (x${i.qty}) — R$ ${sub}`);
  });
  linhas.push('');
  linhas.push(`Subtotal: ${fmtBRL(pedido.subtotal)}`);
  if (pedido.frete) linhas.push(`Frete: ${fmtBRL(pedido.frete)}`);
  linhas.push(`Total: ${fmtBRL(pedido.total)}`);
  linhas.push('');
  linhas.push(`Nome: ${pedido.cliente_nome}`);
  linhas.push(`WhatsApp: ${pedido.cliente_telefone}`);
  if (pedido.observacoes_cliente) {
    linhas.push('');
    linhas.push(`Obs: ${pedido.observacoes_cliente}`);
  }
  if (link) {
    linhas.push('');
    linhas.push(link);
  }
  return linhas.join('\n');
}
