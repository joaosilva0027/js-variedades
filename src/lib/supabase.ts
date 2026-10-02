import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache de instâncias seguras
let cachedServerClient: SupabaseClient | null = null;

/**
 * Retorna com segurança o cliente Supabase para o ambiente de servidor.
 * NUNCA lança exceção: se as variáveis estiverem ausentes, vazias ou inválidas,
 * retorna silenciosamente null sem travar a aplicação.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (cachedServerClient) {
    return cachedServerClient;
  }

  try {
    const rawUrl = 
      process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.SUPABASE_URL || 
      process.env.VITE_SUPABASE_URL ||
      "";

    const rawKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.VITE_SUPABASE_ANON_KEY ||
      "";

    // Validação e limpeza rigorosa da URL
    const sanitizedUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
    const trimmedKey = rawKey.trim();

    if (!sanitizedUrl || !trimmedKey) {
      return null;
    }

    // Deve ser uma URL HTTP/HTTPS válida
    if (!sanitizedUrl.startsWith('http://') && !sanitizedUrl.startsWith('https://')) {
      return null;
    }

    cachedServerClient = createClient(sanitizedUrl, trimmedKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    return cachedServerClient;
  } catch (err) {
    // Nunca trava o servidor se o createClient falhar
    console.error('Supabase ignorado: falha na inicialização do cliente:', err);
    return null;
  }
}

/**
 * Cliente Supabase seguro (lazy getter). Não instancia no carregamento global do arquivo.
 */
export const supabase: SupabaseClient | null = null;
