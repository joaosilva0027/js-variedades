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
    const { items, payer, discountPercent = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Nenhum item informado para o checkout.' });
      return;
    }

    if (!payer || !payer.name || !payer.email) {
      res.status(400).json({ error: 'Dados do cliente incompletos (Nome e E-mail são obrigatórios).' });
      return;
    }

    // Split name into first and last name for Mercado Pago payer schema
    const nameParts = (payer.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Cliente';
    const lastName = nameParts.slice(1).join(' ') || 'JS Variedades';

    // Format phone
    const cleanPhone = (payer.phone || '').replace(/\D/g, '');
    const areaCode = cleanPhone.length >= 10 ? cleanPhone.slice(0, 2) : '11';
    const phoneNumber = cleanPhone.length >= 10 ? cleanPhone.slice(2) : cleanPhone || '999999999';

    // Calculate discounted unit price if coupon was applied
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

    const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

    // Mercado Pago Preference Payload
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
          zip_code: (payer.zipCode || '01001-000').replace(/\D/g, '')
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

    // Extract and compute required order fields for Supabase table 'pedidos'
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

    /**
     * Salva o registro na tabela 'pedidos' do Supabase.
     * Tratamento não-bloqueante: caso haja qualquer erro ou aviso, registra no log
     * e permite que o redirecionamento para o Mercado Pago prossiga sem interrupções.
     */
    const saveOrderToSupabase = async () => {
      try {
        const supabase = getSupabaseServerClient();
        if (!supabase) {
          console.warn('[Supabase] Cliente não inicializado (verifique as credenciais no .env).');
          return;
        }

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
          console.warn('[Supabase] Aviso ao registrar pedido na tabela pedidos:', sbError.message || sbError);
        } else {
          console.log('[Supabase] Pedido gravado com sucesso na tabela pedidos:', inserted?.id || 'OK');
        }
      } catch (sbException: any) {
        console.warn('[Supabase] Falha ao conectar ou salvar pedido no Supabase (não-bloqueante):', sbException?.message || sbException);
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
