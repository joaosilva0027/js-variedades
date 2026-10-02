import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServerClient } from '../src/lib/supabase';

// Helper to extract and format checkout preference
async function processCheckout(body: any, hostHeader?: string | null) {
  const { items = [], payer = {}, discountPercent = 0 } = body || {};

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Nenhum item informado para o checkout.');
  }

  if (!payer || !payer.name || !payer.email) {
    throw new Error('Dados do cliente incompletos (Nome e E-mail são obrigatórios).');
  }

  // Name splitting
  const nameParts = (payer.name || '').trim().split(' ');
  const firstName = nameParts[0] || 'Cliente';
  const lastName = nameParts.slice(1).join(' ') || 'JS Variedades';

  // Phone formatting
  const cleanPhone = (payer.phone || '').replace(/\D/g, '');
  const areaCode = cleanPhone.length >= 10 ? cleanPhone.slice(0, 2) : '11';
  const phoneNumber = cleanPhone.length >= 10 ? cleanPhone.slice(2) : cleanPhone || '999999999';

  // Discount
  const discountMultiplier = discountPercent > 0 ? (100 - discountPercent) / 100 : 1;

  // Prepare Mercado Pago items array
  const mpItems = items.map((item: any, index: number) => {
    const rawPrice = Number(item.price ?? item.unit_price ?? 0);
    const discountedPrice = Math.max(1, Number((rawPrice * discountMultiplier).toFixed(2)));

    return {
      id: String(item.id || `item-${index + 1}`),
      title: String(item.title || 'Produto JS Variedades').slice(0, 127),
      description: String(item.description || item.title || 'Compra na JS Variedades Oficial').slice(0, 250),
      picture_url: item.image || item.imageUrl || item.picture_url || 'https://jsvariedades.com.br/logo.svg',
      category_id: String(item.category || 'others').slice(0, 60),
      quantity: Math.max(1, Number(item.quantity) || 1),
      currency_id: 'BRL',
      unit_price: discountedPrice
    };
  });

  const appUrl = (
    process.env.APP_URL || 
    (hostHeader ? `https://${hostHeader}` : '') || 
    'https://jsvariedades.com.br'
  ).replace(/\/$/, '');

  const preferenceData: any = {
    items: mpItems,
    payer: {
      name: firstName,
      surname: lastName,
      email: payer.email.trim(),
      phone: {
        area_code: areaCode,
        number: phoneNumber
      },
      address: {
        street_name: (payer.address || 'Endereço informado no checkout').slice(0, 120),
        zip_code: (payer.zipCode || payer.cep || '01001-000').replace(/\D/g, '')
      }
    },
    back_urls: {
      success: `${appUrl}/?status=approved&collection_status=approved`,
      failure: `${appUrl}/?status=failure`,
      pending: `${appUrl}/?status=pending`
    },
    auto_return: 'approved',
    statement_descriptor: 'JS VARIEDADES',
    external_reference: `JS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    payment_methods: {
      installments: 12,
      default_installments: 1
    },
    metadata: {
      customer_name: payer.name,
      customer_phone: payer.phone,
      customer_address: payer.address,
      source: 'js_variedades_checkout_pro'
    }
  };

  // Order fields for Supabase table 'pedidos'
  const cepRegex = /\b\d{5}-?\d{3}\b/;
  const matchedCep = (payer.address || '').match(cepRegex)?.[0] || '';
  const clienteCep = (payer.zipCode || payer.cep || matchedCep || '').trim();

  const produtoId = items.length === 1 
    ? String(items[0]?.id || '') 
    : items.map((i: any) => String(i?.id || '')).filter(Boolean).join(', ');

  const produtoTitulo = items.length === 1
    ? String(items[0]?.title || 'Produto JS Variedades')
    : items.map((i: any) => `${i.quantity || 1}x ${i.title || 'Produto'}`).join(', ');

  const valorTotal = Number((items.reduce((acc: number, item: any) => {
    const price = Number(item.price ?? item.unit_price ?? 0);
    const qty = Math.max(1, Number(item.quantity) || 1);
    return acc + (price * qty);
  }, 0) * discountMultiplier).toFixed(2));

  // Non-blocking save to Supabase
  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const pedidoRecord = {
        cliente_nome: (payer.name || '').trim(),
        cliente_email: (payer.email || '').trim(),
        cliente_telefone: (payer.phone || '').trim(),
        cliente_endereco: (payer.address || '').trim(),
        cliente_cep: clienteCep,
        produto_id: produtoId.slice(0, 255),
        produto_titulo: produtoTitulo.slice(0, 255),
        valor_total: valorTotal,
        status_pagamento: 'pendente'
      };

      const { data: inserted, error: sbError } = await supabase
        .from('pedidos')
        .insert([pedidoRecord])
        .select()
        .maybeSingle();

      if (sbError) {
        console.warn('[Supabase Vercel] Aviso ao salvar pedido:', sbError.message || sbError);
      } else {
        console.log('[Supabase Vercel] Pedido gravado:', inserted?.id || 'OK');
      }
    }
  } catch (sbErr: any) {
    console.warn('[Supabase Vercel] Erro não-bloqueante:', sbErr?.message || sbErr);
  }

  // Mercado Pago preference generation
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();

  if (accessToken) {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Integrator-Id': 'dev_jsvariedades'
      },
      body: JSON.stringify(preferenceData)
    });

    const mpData = await mpRes.json();

    if (mpRes.ok && (mpData.init_point || mpData.sandbox_init_point)) {
      const finalUrl = mpData.init_point || mpData.sandbox_init_point;
      return {
        id: mpData.id,
        init_point: finalUrl,
        url: finalUrl,
        sandbox_init_point: mpData.sandbox_init_point || finalUrl,
        isSandbox: !accessToken.startsWith('APP_USR-')
      };
    } else {
      console.warn('[Mercado Pago API Warning]:', mpData);
      // Fallback with status 200 so customer flow never crashes
      const fallbackPrefId = `JS-${Date.now()}`;
      const fallbackUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${fallbackPrefId}`;
      return {
        id: fallbackPrefId,
        init_point: fallbackUrl,
        url: fallbackUrl,
        sandbox_init_point: fallbackUrl,
        isSandbox: true,
        warning: mpData?.message || 'Mercado Pago preference fallback'
      };
    }
  } else {
    // Demonstration fallback
    const demoPrefId = `DEMO-JS-${Date.now()}`;
    const demoUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${demoPrefId}`;
    return {
      id: demoPrefId,
      init_point: demoUrl,
      url: demoUrl,
      sandbox_init_point: demoUrl,
      isSandbox: true,
      message: 'Modo demonstração ativo.'
    };
  }
}

/**
 * Vercel Serverless Function Handler (Node.js runtime)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(200).json({
      status: 'ok',
      endpoint: '/api/checkout',
      message: 'Envie uma requisição POST com { items, payer } para gerar o pagamento.'
    });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
    const result = await processCheckout(body, Array.isArray(hostHeader) ? hostHeader[0] : hostHeader);

    // Guaranteed status 200 with init_point and url
    res.status(200).json(result);
  } catch (error: any) {
    console.error('[Checkout Error]:', error);
    const fallbackId = `ERR-${Date.now()}`;
    const fallbackUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${fallbackId}`;

    // Always return valid JSON and status 200 with init_point/url as requested
    res.status(200).json({
      error: error?.message || 'Erro ao processar checkout.',
      id: fallbackId,
      init_point: fallbackUrl,
      url: fallbackUrl
    });
  }
}

/**
 * Web Standard Request/Response export (for Edge runtime or App Router compatibility)
 */
export async function POST(request: Request) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };

  try {
    const body = await request.json();
    const urlObj = new URL(request.url);
    const result = await processCheckout(body, urlObj.host);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers
    });
  } catch (error: any) {
    const fallbackId = `ERR-${Date.now()}`;
    const fallbackUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${fallbackId}`;

    return new Response(JSON.stringify({
      error: error?.message || 'Erro ao processar checkout.',
      id: fallbackId,
      init_point: fallbackUrl,
      url: fallbackUrl
    }), {
      status: 200,
      headers
    });
  }
}
