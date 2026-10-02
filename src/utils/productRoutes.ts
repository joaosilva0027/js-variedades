import { Product } from '../types';

/**
 * Converte um texto ou título em slug amigável para URLs e campanhas do Meta Ads
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
    .replace(/[\s_]+/g, '-') // substitui espaços por traços
    .replace(/-+/g, '-') // remove múltiplos traços seguidos
    .replace(/^-+|-+$/g, ''); // remove traços no início e fim
}

/**
 * Retorna o slug exclusivo do produto.
 * Dá prioridade a slug pré-existente, extrai da URL de origem ou gera a partir do título.
 */
export function getProductSlug(product: Product): string {
  if (!product) return '';

  if ((product as any).slug && typeof (product as any).slug === 'string') {
    return (product as any).slug;
  }

  if (product.url && typeof product.url === 'string') {
    const match = product.url.match(/produto\/([^/]+)/);
    if (match && match[1]) {
      return match[1].toLowerCase().trim();
    }
  }

  const generated = slugify(product.title);
  return generated || product.id;
}

/**
 * Retorna a rota absoluta/relativa para a página individual do produto
 */
export function getProductUrl(product: Product): string {
  if (!product) return '/';
  const slug = getProductSlug(product);
  return `/produtos/${slug}`;
}

/**
 * Localiza um produto na lista utilizando ID, slug exato, URL de origem ou termos-chave
 */
export function findProductByIdOrSlug(products: Product[], rawIdentifier: string): Product | null {
  if (!rawIdentifier || !Array.isArray(products) || products.length === 0) {
    return null;
  }

  let clean = decodeURIComponent(rawIdentifier).trim().toLowerCase();
  clean = clean.replace(/^\/+|\/+$/g, '');
  // Se veio /produtos/cook-home, remove o prefixo
  clean = clean.replace(/^(produtos|produto|p)\//, '');

  if (!clean) return null;

  // 1. Busca por ID direto (ex: prod-1)
  const byId = products.find(p => p.id && p.id.toLowerCase() === clean);
  if (byId) return byId;

  // 2. Busca por slug exato (ex: skate-infantil-estampado-c-kit-de-protecao-grafite)
  const bySlug = products.find(p => getProductSlug(p).toLowerCase() === clean);
  if (bySlug) return bySlug;

  // 3. Busca por URL de origem contendo o termo
  const byUrl = products.find(p => {
    if (!p.url) return false;
    return p.url.toLowerCase().includes(clean);
  });
  if (byUrl) return byUrl;

  // 4. Substring no slug ou no título normalizado (ex: 'cook-home' encontra 'arthi-cozinha-1409-cook-home-9-collection-prateado')
  const bySubstring = products.find(p => {
    const s = getProductSlug(p).toLowerCase();
    const ts = slugify(p.title);
    return s.includes(clean) || clean.includes(s) || ts.includes(clean);
  });
  if (bySubstring) return bySubstring;

  // 5. Palavras-chave múltiplas (ex: 'cook', 'home')
  const words = clean.split(/[-_\s]+/).filter(w => w.length >= 3);
  if (words.length > 0) {
    const byKeywords = products.find(p => {
      const lower = p.title.toLowerCase();
      return words.every(w => lower.includes(w));
    });
    if (byKeywords) return byKeywords;
  }

  // 6. ID numérico puro (ex: '1' -> 'prod-1')
  if (/^\d+$/.test(clean)) {
    const byNum = products.find(p => p.id.toLowerCase() === `prod-${clean}`);
    if (byNum) return byNum;
  }

  return null;
}
