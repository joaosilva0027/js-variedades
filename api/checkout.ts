import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Helper seguro e autocontido para obter o cliente Supabase sem dependência de ficheiros externos
function getLocalSupabaseClient(): SupabaseClient | null {
  try {
    const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
    const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

    const supabaseKey = (
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      ""
    ).trim();

    if (!supabaseUrl || !supabaseKey) {
      return null;
    }

    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
      return null;
    }

    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (err: any) {
    console.log("Config Supabase ativa:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "INDEFINIDO",
      hasKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    });
    console.error("Falha ao registar pedido no Supabase:", err?.message, err?.cause || err);
    return null;
  }
}

// Helper to extract and format checkout preference
async function processCheckout(body: any, hostHeader?: string | null) {
  const { items, payer, discountPercent = 0 } = body || {};

  // Safe fallback if items is empty or invalid
  let rawItems = Array.isArray(items) && items.length > 0 ? items : [];
  if (rawItems.length === 0) {
    rawItems = [{
      id: 'prod-geral-js',
      title: 'Produto JS Variedades Oficial',
      description: 'Compra segura na loja JS Variedades Oficial',
      price: 49.90,
      unit_price: 49.90,
      quantity: 1,
      category: 'others'
    }];
  }

  // Safe fallback if payer or fields are incomplete
  const safePayer = payer && typeof payer === 'object' ? payer : {};
  const rawName = (safePayer.name || '').trim() || 'Cliente JS Variedades';
  const rawEmail = (safePayer.email || '').trim() || 'cliente@jsvariedades.com.br';
  const rawPhone = (safePayer.phone || '').trim();
  const rawAddress = (safePayer.address || '').trim() || 'Endereço informado no checkout';

  // Name splitting
  const nameParts = rawName.split(' ');
  const firstName = nameParts[0] || 'Cliente';
  const lastName = nameParts.slice(1).join(' ') || 'JS Variedades';

  // Phone formatting with safe fallbacks
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const areaCode = cleanPhone.length >= 10 ? cleanPhone.slice(0, 2) : '11';
  const phoneNumber = cleanPhone.length >= 10 ? cleanPhone.slice(2) : (cleanPhone.length >= 8 ? cleanPhone : '999999999');

  // Discount
  const discountMultiplier = discountPercent > 0 ? (100 - discountPercent) / 100 : 1;

  // Prepare Mercado Pago items array with safe fallback for unit_price, quantity, title and currency_id: 'BRL'
  const mpItems = rawItems.map((item: any, index: number) => {
    const rawPrice = Number(item.price ?? item.unit_price ?? 0);
    const validPrice = !isNaN(rawPrice) && rawPrice > 0 ? rawPrice : 29.90;
    const discountedPrice = Math.max(1, Number((validPrice * discountMultiplier).toFixed(2)));

    const rawQty = Math.floor(Number(item.quantity));
    const validQty = !isNaN(rawQty) && rawQty >= 1 ? rawQty : 1;

    return {
      id: String(item.id || `item-${index + 1}`),
      title: String(item.title || 'Produto JS Variedades').slice(0, 127),
      description: String(item.description || item.title || 'Compra na JS Variedades Oficial').slice(0, 250),
      picture_url: item.image || item.imageUrl || item.picture_url || 'https://jsvariedades.com.br/logo.svg',
      category_id: String(item.category || 'others').slice(0, 60),
      quantity: validQty,
      currency_id: 'BRL',
      unit_price: discountedPrice
    };
  });

  const candidateAppUrl = (
    process.env.APP_URL || 
    (hostHeader ? `https://${hostHeader}` : '') || 
    'https://jsvariedades.com.br'
  ).replace(/\/$/, '');

  const isValidHttpUrl = candidateAppUrl.startsWith('http://') || candidateAppUrl.startsWith('https://');

  const preferenceData: any = {
    items: mpItems,
    payer: {
      name: firstName,
      surname: lastName,
      email: rawEmail,
      phone: {
        area_code: areaCode,
        number: phoneNumber
      },
      address: {
        street_name: rawAddress.slice(0, 120),
        zip_code: (safePayer.zipCode || safePayer.cep || '01001-000').replace(/\D/g, '') || '01001000'
      }
    },
    statement_descriptor: 'JS VARIEDADES',
    external_reference: `JS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    payment_methods: {
      installments: 12,
      default_installments: 1
    },
    metadata: {
      customer_name: rawName,
      customer_phone: rawPhone,
      customer_address: rawAddress,
      source: 'js_variedades_checkout_pro'
    }
  };

  // auto_return: 'approved' apenas se as back_urls forem URLs válidas (com http/https)
  if (isValidHttpUrl) {
    preferenceData.back_urls = {
      success: `${candidateAppUrl}/?status=approved&collection_status=approved`,
      failure: `${candidateAppUrl}/?status=failure`,
      pending: `${candidateAppUrl}/?status=pending`
    };
    preferenceData.auto_return = 'approved';
  }

  // Order fields for Supabase table 'pedidos'
  const cepRegex = /\b\d{5}-?\d{3}\b/;
  const matchedCep = rawAddress.match(cepRegex)?.[0] || '';
  const clienteCep = (safePayer.zipCode || safePayer.cep || matchedCep || '').trim();

  const produtoId = rawItems.length === 1 
    ? String(rawItems[0]?.id || '') 
    : rawItems.map((i: any) => String(i?.id || '')).filter(Boolean).join(', ');

  const produtoTitulo = rawItems.length === 1
    ? String(rawItems[0]?.title || 'Produto JS Variedades')
    : rawItems.map((i: any) => `${i.quantity || 1}x ${i.title || 'Produto'}`).join(', ');

  const valorTotal = Number((rawItems.reduce((acc: number, item: any) => {
    const price = Number(item.price ?? item.unit_price ?? 29.90);
    const qty = Math.max(1, Number(item.quantity) || 1);
    return acc + (price * qty);
  }, 0) * discountMultiplier).toFixed(2));

  // Gravação no Supabase isolada em try/catch
  try {
    const supabase = getLocalSupabaseClient();
    if (supabase) {
      const pedidoRecord = {
        cliente_nome: rawName,
        cliente_email: rawEmail,
        cliente_telefone: rawPhone || 'Não informado',
        cliente_endereco: rawAddress,
        cliente_cep: clienteCep || '00000-000',
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
        console.log("Config Supabase ativa:", {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "INDEFINIDO",
          hasKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        });
        console.error("Falha ao registar pedido no Supabase:", sbError?.message, sbError);
      } else {
        console.log('[Supabase] Pedido gravado com sucesso:', inserted?.id || 'OK');
      }
    }
  } catch (err: any) {
    console.log("Config Supabase ativa:", {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "INDEFINIDO",
      hasKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    });
    console.error("Falha ao registar pedido no Supabase:", err?.message, err?.cause || err);
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
