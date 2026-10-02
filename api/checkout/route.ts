import { getSupabaseServerClient } from '../../src/lib/supabase';

/**
 * Endpoint de API /api/checkout (compatibilidade com padrão Route Handler)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, payer, discountPercent = 0 } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum item informado para o checkout.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!payer || !payer.name || !payer.email) {
      return new Response(JSON.stringify({ error: 'Dados do cliente incompletos (Nome e E-mail são obrigatórios).' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const discountMultiplier = discountPercent > 0 ? (100 - discountPercent) / 100 : 1;
    const valorTotal = Number((items.reduce((acc: number, item: any) => {
      const price = Number(item.price ?? item.unit_price ?? 0);
      const qty = Math.max(1, Number(item.quantity) || 1);
      return acc + (price * qty);
    }, 0) * discountMultiplier).toFixed(2));

    const produtoId = items.length === 1 
      ? String(items[0]?.id || '') 
      : items.map((i: any) => String(i?.id || '')).filter(Boolean).join(', ');

    const produtoTitulo = items.length === 1
      ? String(items[0]?.title || 'Produto JS Variedades')
      : items.map((i: any) => `${i.quantity || 1}x ${i.title || 'Produto'}`).join(', ');

    const cepRegex = /\b\d{5}-?\d{3}\b/;
    const matchedCep = (payer.address || '').match(cepRegex)?.[0] || '';
    const clienteCep = (payer.zipCode || payer.cep || matchedCep || '').trim();

    // Inserção no Supabase (não-bloqueante)
    try {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        await supabase.from('pedidos').insert([{
          cliente_nome: (payer.name || '').trim(),
          cliente_email: (payer.email || '').trim(),
          cliente_telefone: (payer.phone || '').trim(),
          cliente_endereco: (payer.address || '').trim(),
          cliente_cep: clienteCep,
          produto_id: produtoId.slice(0, 255),
          produto_titulo: produtoTitulo.slice(0, 255),
          valor_total: valorTotal,
          status_pagamento: 'pendente'
        }]);
      }
    } catch (err) {
      console.warn('[Supabase route handler] Erro não-bloqueante ao salvar pedido:', err);
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
