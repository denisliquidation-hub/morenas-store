-- ============================================================================
-- FASE 3 · Pedidos no Banco
-- Tabelas pedidos + itens_pedido, sequence pro numero_pedido, RLS, trigger
-- que baixa estoque automaticamente ao marcar status='pago'.
--
-- Aplicar via: Supabase Dashboard > SQL Editor > New Query > cola e roda
-- Idempotente: pode rodar mais de uma vez sem efeito colateral.
-- ============================================================================

-- 1. Sequence pro numero_pedido (formato MRN-YYYY-NNNN)
CREATE SEQUENCE IF NOT EXISTS public.pedidos_numero_seq;

-- 2. Função geradora do numero_pedido
CREATE OR REPLACE FUNCTION public.gerar_numero_pedido()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_num bigint;
BEGIN
  v_num := nextval('public.pedidos_numero_seq');
  RETURN 'MRN-' || extract(year from now())::text || '-' || lpad(v_num::text, 4, '0');
END;
$$;

-- 3. Tabela pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido text UNIQUE NOT NULL DEFAULT public.gerar_numero_pedido(),
  cliente_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cliente_nome text NOT NULL,
  cliente_telefone text NOT NULL,
  cliente_email text,
  cliente_endereco jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  frete numeric(10,2),
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'aguardando-confirmacao'
    CHECK (status IN (
      'aguardando-confirmacao',
      'confirmado',
      'pago',
      'separando',
      'enviado',
      'entregue',
      'cancelado'
    )),
  forma_pagamento text CHECK (forma_pagamento IN ('pix','cartao','whatsapp','dinheiro','transferencia') OR forma_pagamento IS NULL),
  codigo_rastreio text,
  observacoes_cliente text,
  observacoes_admin text,
  whatsapp_message_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pedidos IS 'Pedidos da loja. Criados via carrinho web (status aguardando-confirmacao), evoluem manualmente pelo admin. Status pago dispara baixa de estoque automatica.';

CREATE INDEX IF NOT EXISTS pedidos_cliente_idx ON public.pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS pedidos_status_idx ON public.pedidos(status);
CREATE INDEX IF NOT EXISTS pedidos_created_idx ON public.pedidos(created_at DESC);
CREATE INDEX IF NOT EXISTS pedidos_telefone_idx ON public.pedidos(cliente_telefone);

-- Trigger updated_at
DROP TRIGGER IF EXISTS set_pedidos_updated_at ON public.pedidos;
CREATE TRIGGER set_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Tabela itens_pedido
CREATE TABLE IF NOT EXISTS public.itens_pedido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  produto_snapshot jsonb NOT NULL,
  tamanho text,
  quantidade int NOT NULL CHECK (quantidade > 0),
  preco_unitario numeric(10,2) NOT NULL CHECK (preco_unitario >= 0),
  subtotal numeric(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.itens_pedido IS 'Itens de cada pedido. produto_snapshot guarda nome/preco/imagem na hora da compra (preserva historico se produto for editado/deletado).';

CREATE INDEX IF NOT EXISTS itens_pedido_idx ON public.itens_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS itens_pedido_produto_idx ON public.itens_pedido(produto_id);

-- 5. RLS pedidos
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente ve proprios pedidos" ON public.pedidos;
CREATE POLICY "Cliente ve proprios pedidos"
  ON public.pedidos FOR SELECT
  USING (
    auth.uid() = cliente_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Anyone pode criar pedido" ON public.pedidos;
CREATE POLICY "Anyone pode criar pedido"
  ON public.pedidos FOR INSERT
  WITH CHECK (
    -- guest checkout (deslogado, cliente_id null) OU logado vinculando ao próprio user
    (auth.uid() IS NULL AND cliente_id IS NULL)
    OR (auth.uid() IS NOT NULL AND cliente_id = auth.uid())
    OR (auth.uid() IS NOT NULL AND cliente_id IS NULL)
  );

DROP POLICY IF EXISTS "Admin atualiza pedido" ON public.pedidos;
CREATE POLICY "Admin atualiza pedido"
  ON public.pedidos FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin deleta pedido" ON public.pedidos;
CREATE POLICY "Admin deleta pedido"
  ON public.pedidos FOR DELETE
  USING (public.is_admin());

-- 6. RLS itens_pedido
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cliente ve itens dos proprios pedidos" ON public.itens_pedido;
CREATE POLICY "Cliente ve itens dos proprios pedidos"
  ON public.itens_pedido FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = itens_pedido.pedido_id
        AND (p.cliente_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Anyone pode inserir item em pedido proprio" ON public.itens_pedido;
CREATE POLICY "Anyone pode inserir item em pedido proprio"
  ON public.itens_pedido FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pedidos p
      WHERE p.id = itens_pedido.pedido_id
        AND (
          (auth.uid() IS NULL AND p.cliente_id IS NULL)
          OR p.cliente_id = auth.uid()
          OR public.is_admin()
        )
        -- só permite inserir item logo após criar pedido (anti spam)
        AND p.created_at > now() - interval '5 minutes'
    )
  );

DROP POLICY IF EXISTS "Admin atualiza itens" ON public.itens_pedido;
CREATE POLICY "Admin atualiza itens"
  ON public.itens_pedido FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin deleta itens" ON public.itens_pedido;
CREATE POLICY "Admin deleta itens"
  ON public.itens_pedido FOR DELETE
  USING (public.is_admin());

-- 7. Trigger critico: quando status muda pra 'pago', baixa estoque automaticamente
CREATE OR REPLACE FUNCTION public.baixar_estoque_pedido_pago()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item record;
BEGIN
  IF NEW.status = 'pago' AND (OLD.status IS DISTINCT FROM 'pago') THEN
    FOR v_item IN
      SELECT produto_id, quantidade
      FROM public.itens_pedido
      WHERE pedido_id = NEW.id AND produto_id IS NOT NULL
    LOOP
      INSERT INTO public.movimentacoes_estoque (
        produto_id, tipo, quantidade, motivo, observacao
      ) VALUES (
        v_item.produto_id,
        'saida',
        v_item.quantidade,
        'venda',
        'Pedido ' || NEW.numero_pedido
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS baixar_estoque_on_pago ON public.pedidos;
CREATE TRIGGER baixar_estoque_on_pago
  AFTER UPDATE OF status ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.baixar_estoque_pedido_pago();
