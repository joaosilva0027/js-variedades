import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSupabaseServerClient } from './src/lib/supabase';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    store: 'JS Variedades',
    mercadoPagoConfigured: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN),
    supabaseConfigured: Boolean(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    )
  });
});

/**
 * POST /api/checkout
 * Generates a Mercado Pago Checkout Pro Preference
 */
app.post('/api/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, payer, discountPercent = 0 } = req.body || {};

    // Requirement 3: Safe fallback if items is empty or invalid
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

    // Split name into first and last name for Mercado Pago payer schema
    const nameParts = rawName.split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'JS Variedades';

    // Format phone with safe fallbacks
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const areaCode = cleanPhone.length >= 10 ? cleanPhone.slice(0, 2) : '11';
    const phoneNumber = cleanPhone.length >= 10 ? cleanPhone.slice(2) : (cleanPhone.length >= 8 ? cleanPhone : '999999999');

    // Calculate discounted unit price if coupon was applied
    const discountMultiplier = discountPercent > 0 ? (100 - discountPercent) / 100 : 1;

    // Prepare Mercado Pago items array with safe fallback for unit_price and quantity
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

    const candidateAppUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
    const isValidHttpUrl = candidateAppUrl.startsWith('http://') || candidateAppUrl.startsWith('https://');

    // Mercado Pago Preference Payload
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

    // Extract and compute required order fields for Supabase table 'pedidos'
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

    /**
     * Requirement 2: Se o cliente do Supabase for null ou se a inserção falhar no try/catch, 
     * faça apenas console.error("Supabase ignorado:") e prossiga SEM travar o fluxo.
     */
    const saveOrderToSupabase = async () => {
      try {
        const supabase = getSupabaseServerClient();
        if (!supabase) {
          console.error('Supabase ignorado: cliente não configurado ou credenciais ausentes.');
          return;
        }

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
      } catch (err: any) {
        console.log("Config Supabase ativa:", {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "INDEFINIDO",
          hasKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        });
        console.error("Falha ao registar pedido no Supabase:", err?.message, err?.cause || err);
      }
    };

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();

    if (accessToken) {
      // Call official Mercado Pago REST API
      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Integrator-Id': 'dev_jsvariedades'
        },
        body: JSON.stringify(preferenceData)
      });

      const mpData = await mpResponse.json();

      if (!mpResponse.ok) {
        console.error('Mercado Pago API error:', mpData);
        res.status(mpResponse.status).json({
          error: mpData.message || 'Erro ao gerar preferência no Mercado Pago.',
          details: mpData
        });
        return;
      }

      console.log(`[Mercado Pago] Preference created: ${mpData.id}`);

      // Salva no Supabase antes de devolver a URL do Mercado Pago
      await saveOrderToSupabase();

      const finalUrl = mpData.init_point || mpData.sandbox_init_point;

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200).json({
        id: mpData.id,
        init_point: finalUrl,
        url: finalUrl,
        sandbox_init_point: mpData.sandbox_init_point || finalUrl,
        isSandbox: !accessToken.startsWith('APP_USR-')
      });
      return;
    } else {
      // Fallback / Demonstration mode when token is not yet set in environment
      // Generates a mock preference ID and Mercado Pago payment link simulation
      console.warn('[Mercado Pago] MERCADO_PAGO_ACCESS_TOKEN não configurado no .env. Gerando link seguro de demonstração.');
      
      const simulatedPrefId = `DEMO-JS-${Date.now()}`;
      const simulatedInitPoint = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${simulatedPrefId}`;

      // Salva no Supabase também em modo demonstração
      await saveOrderToSupabase();

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.status(200).json({
        id: simulatedPrefId,
        init_point: simulatedInitPoint,
        url: simulatedInitPoint,
        sandbox_init_point: simulatedInitPoint,
        isSandbox: true,
        message: 'Preferência gerada em modo demonstração. Para ativar pagamentos reais, configure MERCADO_PAGO_ACCESS_TOKEN no .env'
      });
      return;
    }
  } catch (error: any) {
    console.error('Erro interno na rota /api/checkout:', error);
    const fallbackId = `ERR-${Date.now()}`;
    const fallbackUrl = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${fallbackId}`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({
      id: fallbackId,
      init_point: fallbackUrl,
      url: fallbackUrl,
      error: 'Erro interno ao processar o checkout com Mercado Pago.',
      message: error?.message || 'Redirecionando...'
    });
  }
});

// Vite middlewares for dev or static for prod
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true'
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JS Variedades Server running on http://0.0.0.0:${PORT}`);
    console.log(`💳 Mercado Pago Checkout Pro route active on /api/checkout`);
  });
}

setupViteOrStatic();
