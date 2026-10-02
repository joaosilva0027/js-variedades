import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Retorna o cliente Supabase configurado para o ambiente de servidor (Node.js/Express).
 * Prioriza a chave de serviço SUPABASE_SERVICE_ROLE_KEY com bypass de RLS,
 * ou recorre à NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.SUPABASE_URL || 
    process.env.VITE_SUPABASE_URL;

  const supabaseKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Supabase] URL ou chave do Supabase não configuradas no ambiente.');
    return null;
  }

  try {
    return createClient(supabaseUrl.trim(), supabaseKey.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (err) {
    console.error('[Supabase] Falha ao inicializar cliente Supabase:', err);
    return null;
  }
}

/**
 * Cliente Supabase padrão para uso compartilhado se as variáveis estiverem presentes.
 */
const defaultUrl = 
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_SUPABASE_URL || process.env?.SUPABASE_URL)) || '';
const defaultKey = 
  (typeof process !== 'undefined' && (process.env?.SUPABASE_SERVICE_ROLE_KEY || process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) || '';

export const supabase: SupabaseClient | null = defaultUrl && defaultKey 
  ? createClient(defaultUrl.trim(), defaultKey.trim()) 
  : null;
