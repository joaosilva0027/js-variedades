import type { VercelRequest, VercelResponse } from '@vercel/node';
import checkoutHandler from './checkout';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';

  if (url.includes('checkout')) {
    return checkoutHandler(req, res);
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    store: 'JS Variedades API Gateway',
    endpoints: ['/api/checkout', '/api/health'],
    mercadoPagoConfigured: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN),
    supabaseConfigured: Boolean(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    )
  });
}
