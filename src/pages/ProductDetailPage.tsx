import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Zap, 
  Check, 
  Share2, 
  Heart, 
  ArrowLeft, 
  Copy, 
  Lock, 
  RefreshCw, 
  Clock, 
  PackageCheck, 
  MessageCircle, 
  ChevronRight,
  Plus,
  Minus,
  AlertTriangle,
  BadgeCheck,
  ShoppingBag
} from 'lucide-react';
import { Product } from '../types';
import { getProductUrl } from '../utils/productRoutes';
import { navigateTo } from '../utils/navigation';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onAddToCart,
  onBuyNow,
  isFavorite,
  onToggleFavorite
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.image || product.imageUrl || product.mainImage || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [cepInput, setCepInput] = useState<string>('');
  const [freteCalculado, setFreteCalculado] = useState<boolean>(false);
  const [calculatingFrete, setCalculatingFrete] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'descricao' | 'especificacoes' | 'avaliacoes'>('descricao');
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false);

  // Normalização de preços
  const displayPrice = product.price ?? product.priceDiscount ?? 0;
  const displayOriginalPrice = product.originalPrice ?? product.priceOriginal ?? (displayPrice * 1.4);
  const pixPrice = displayPrice === 199.90 ? 189.90 : Math.floor(displayPrice * 0.95 * 100) / 100;
  const discountPercent = product.discountPercent || Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100);

  // Galeria de imagens
  const images = useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.imageUrl && !list.includes(product.imageUrl)) list.push(product.imageUrl);
    if (product.mainImage && !list.includes(product.mainImage)) list.push(product.mainImage);
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (Array.isArray(product.galleryImages)) {
      product.galleryImages.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'];
  }, [product]);

  // Atualiza a imagem selecionada quando o produto muda
  useEffect(() => {
    setSelectedImage(images[0] || '');
    setQuantity(1);
    setFreteCalculado(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product, images]);

  // SEO, OpenGraph e Meta Tags dinâmicas para Meta Ads e Compartilhamento
  useEffect(() => {
    const previousTitle = document.title;
    const pageTitle = `${product.title} • JS Variedades Oficial`;
    document.title = pageTitle;

    // Atualiza metatags no head
    const updateMetaTag = (selector: string, attr: string, value: string) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (selector.includes('property=')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1] || '';
          tag.setAttribute('property', prop);
        } else if (selector.includes('name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1] || '';
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute(attr, value);
    };

    const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://jsvariedades.com.br${getProductUrl(product)}`;
    const mainImg = images[0] || 'https://jsvariedades.com.br/logo.svg';
    const cleanDesc = product.description.replace(/<[^>]*>?/gm, '').slice(0, 160);

    updateMetaTag('meta[name="description"]', 'content', cleanDesc);
    updateMetaTag('meta[property="og:title"]', 'content', pageTitle);
    updateMetaTag('meta[property="og:description"]', 'content', cleanDesc);
    updateMetaTag('meta[property="og:image"]', 'content', mainImg);
    updateMetaTag('meta[property="og:url"]', 'content', currentUrl);
    updateMetaTag('meta[property="og:type"]', 'content', 'product');
    updateMetaTag('meta[property="product:price:amount"]', 'content', displayPrice.toFixed(2));
    updateMetaTag('meta[property="product:price:currency"]', 'content', 'BRL');
    updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'content', pageTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', cleanDesc);
    updateMetaTag('meta[name="twitter:image"]', 'content', mainImg);

    // Schema.org Structured Data (JSON-LD)
    const scriptId = 'product-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "image": images,
      "description": cleanDesc,
      "sku": product.id,
      "brand": {
        "@type": "Brand",
        "name": "JS Variedades"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating || 4.9,
        "reviewCount": product.reviewsCount || 128
      },
      "offers": {
        "@type": "Offer",
        "url": currentUrl,
        "priceCurrency": "BRL",
        "price": displayPrice.toFixed(2),
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "JS Variedades Oficial"
        }
      }
    };
    scriptTag.text = JSON.stringify(structuredData);

    return () => {
      document.title = previousTitle;
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [product, images, displayPrice]);

  // Produtos relacionados
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(p => p.id !== product.id && (p.category === product.category || p.featured))
      .slice(0, 4);
  }, [allProducts, product]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Confira este achadinho na JS Variedades Oficial: ${product.title}`,
          url
        });
        return;
      } catch {
        // Fallback to copy
      }
    }
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSimularFrete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cepInput || cepInput.replace(/\D/g, '').length < 8) return;
    setCalculatingFrete(true);
    setTimeout(() => {
      setCalculatingFrete(false);
      setFreteCalculado(true);
    }, 600);
  };

  const handleAddToCartWithToast = () => {
    onAddToCart(product, quantity);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2000);
  };

  // Depoimentos simulados de alta conversão para o Meta Ads
  const reviews = useMemo(() => [
    {
      author: "Juliana Mendes",
      location: "São Paulo, SP",
      rating: 5,
      date: "Há 2 dias",
      comment: "Chegou super rápido em 3 dias! O produto é exatamente igual ao anúncio, excelente qualidade e já recomendei para as minhas amigas.",
      verified: true
    },
    {
      author: "Rodrigo Carvalho",
      location: "Belo Horizonte, MG",
      rating: 5,
      date: "Há 4 dias",
      comment: "Amei o atendimento da JS Variedades! Acompanhei o rastreio pelo WhatsApp e veio muito bem embalado. Compra 100% segura.",
      verified: true
    },
    {
      author: "Mariana Costa",
      location: "Curitiba, PR",
      rating: 5,
      date: "Há 1 semana",
      comment: "Excelente custo benefício. Paguei no PIX com 5% de desconto e aprovação imediata no Mercado Pago. Nota 10!",
      verified: true
    }
  ], []);

  return (
    <div className="min-h-screen bg-slate-50 pt-2 pb-16">
      
      {/* Toast Feedback de Adicionado */}
      {isAddedToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce border border-slate-700">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold">Adicionado ao carrinho!</p>
            <p className="text-[11px] text-slate-300">{quantity}x {product.title.slice(0, 32)}...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb e Botão Voltar */}
        <div className="py-3 flex items-center justify-between text-xs text-slate-500">
          <nav className="flex items-center gap-1.5 flex-wrap">
            <button 
              onClick={() => navigateTo('/')}
              className="hover:text-blue-600 transition-colors flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-600 font-medium">{product.category}</span>
            <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:inline" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs hidden sm:inline">
              {product.title}
            </span>
          </nav>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all font-semibold shadow-xs"
            title="Compartilhar link oficial deste produto"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 text-[11px] font-bold">Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px]">Compartilhar</span>
              </>
            )}
          </button>
        </div>

        {/* Main Product Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 lg:p-8 mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* COLUNA ESQUERDA: FOTOS DO PRODUTO */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              {/* Imagem Principal em Destaque */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                <img 
                  src={selectedImage} 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Selos Flutuantes */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    -{discountPercent}% OFF
                  </span>
                  {product.freeShipping && (
                    <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Frete Grátis Brasil
                    </span>
                  )}
                  {product.badges?.map((badge, idx) => (
                    <span key={idx} className="bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => onToggleFavorite(product)}
                  className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/95 hover:bg-white text-slate-400 hover:text-rose-500 shadow-md transition-all active:scale-90"
                  title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Miniaturas da Galeria */}
              {images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative flex-shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === img
                          ? 'border-blue-600 ring-2 ring-blue-100 scale-98'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Selos de Confiança abaixo das fotos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-800">Garantia 90 Dias</span>
                  <span className="text-[9px] text-slate-500">Troca sem burocracia</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center">
                  <Truck className="w-5 h-5 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-800">Envio Rápido</span>
                  <span className="text-[9px] text-slate-500">Rastreio no WhatsApp</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center">
                  <Lock className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-800">Checkout Seguro</span>
                  <span className="text-[9px] text-slate-500">Mercado Pago Oficial</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center">
                  <RefreshCw className="w-5 h-5 text-amber-600 mb-1" />
                  <span className="text-[10px] font-bold text-slate-800">7 Dias Devolução</span>
                  <span className="text-[9px] text-slate-500">Satisfação ou 100% volta</span>
                </div>
              </div>

            </div>

            {/* COLUNA DIREITA: TÍTULO, PREÇO, BOTÕES E BENEFÍCIOS */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                
                {/* Categoria e Tag de Estoque */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-blue-600 uppercase tracking-wider text-[11px] bg-blue-50 px-2.5 py-0.5 rounded-md">
                    {product.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {product.stockStatus || 'Em estoque • Pronta Entrega'}
                  </span>
                </div>

                {/* Título Principal */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {product.title}
                </h1>

                {/* Avaliações e Código */}
                <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-500 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-slate-800 ml-1">{product.rating || 4.9}</span>
                  </div>
                  <span>•</span>
                  <span className="text-slate-600 font-medium">({product.reviewsCount || 128} avaliações de compradores)</span>
                  <span>•</span>
                  <span className="text-slate-400 font-mono text-[10px]">Cód: {product.id}</span>
                </div>

                {/* Bloco de Preço e Parcelamento */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200">
                  <div className="text-xs text-slate-400 line-through">
                    De: R$ {displayOriginalPrice.toFixed(2).replace('.', ',')}
                  </div>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-black text-blue-700 font-mono tracking-tight">
                      R$ {displayPrice.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Economize R$ {(displayOriginalPrice - displayPrice).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* Preço PIX com Desconto Especial */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-900">
                          R$ {pixPrice.toFixed(2).replace('.', ',')} no PIX
                        </span>
                        <span className="text-emerald-700 ml-1 font-medium">(5% de desconto extra)</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[10px] uppercase bg-emerald-600 text-white px-2 py-0.5 rounded">
                      Aprovação Imediata
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>{product.installments || `em até 12x de R$ ${(displayPrice / 12).toFixed(2).replace('.', ',')} no cartão`}</span>
                  </div>
                </div>

                {/* Seletor de Quantidade */}
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Quantidade:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-xs overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-slate-800 text-sm font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {quantity > 1 && (
                    <span className="text-xs text-slate-500 font-mono">
                      Subtotal: R$ {(displayPrice * quantity).toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </div>

                {/* BOTÕES DE COMPRA E CHECKOUT MERCADO PAGO */}
                <div className="mt-5 space-y-2.5">
                  <button
                    onClick={() => onBuyNow(product, quantity)}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
                  >
                    <Zap className="w-5 h-5 fill-amber-300 text-amber-300 animate-pulse" />
                    <span>COMPRAR AGORA • MERCADO PAGO</span>
                  </button>

                  <button
                    onClick={handleAddToCartWithToast}
                    className="w-full py-3.5 px-6 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    <span>Adicionar ao Carrinho</span>
                  </button>
                </div>

                {/* Simulador de Frete com Entrega Estimada */}
                <div className="mt-5 pt-4 border-t border-slate-200">
                  <form onSubmit={handleSimularFrete} className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Calcular prazo e frete para sua região:</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Digite seu CEP (Ex: 01001-000)"
                        value={cepInput}
                        onChange={(e) => setCepInput(e.target.value)}
                        maxLength={9}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={calculatingFrete}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                      >
                        {calculatingFrete ? 'Calculando...' : 'Calcular'}
                      </button>
                    </div>

                    {freteCalculado && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between font-bold text-emerald-900">
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Envio Expresso com Seguro
                          </span>
                          <span className="text-emerald-700 uppercase">Grátis</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Previsão de entrega: <strong>3 a 7 dias úteis</strong> após a postagem.
                        </p>
                      </div>
                    )}
                  </form>
                </div>

              </div>

              {/* Banner de Garantia Oficial */}
              <div className="mt-6 p-3.5 rounded-2xl bg-slate-900 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Garantia Blindada JS Variedades</p>
                  <p className="text-[11px] text-slate-300">Produto 100% original, verificado antes do envio com código de rastreamento oficial.</p>
                </div>
              </div>

            </div>

          </div>

          {/* ABAS INFORMATIVAS: DESCRIÇÃO, ESPECIFICAÇÕES E AVALIAÇÕES */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            
            {/* Tabs Header */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('descricao')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'descricao'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Descrição Detalhada
              </button>
              <button
                onClick={() => setActiveTab('especificacoes')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'especificacoes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Benefícios & Garantias
              </button>
              <button
                onClick={() => setActiveTab('avaliacoes')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'avaliacoes'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Avaliações de Clientes ({product.reviewsCount || 128})
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              
              {activeTab === 'descricao' && (
                <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-4">
                  <p className="font-medium text-base text-slate-900">
                    {product.description}
                  </p>
                  <p>
                    Compre com total segurança na <strong>JS Variedades Oficial</strong>. Trabalhamos exclusivamente com produtos selecionados, testados e aprovados que viralizam pela durabilidade, inovação e excelente custo-benefício.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Original & Certificado
                      </h4>
                      <p className="text-xs text-slate-600">Material de alta durabilidade com nota e garantia total contra defeitos.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Pronto para Uso
                      </h4>
                      <p className="text-xs text-slate-600">Acompanha kit completo e manual com instruções claras em português.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Suporte Humanizado
                      </h4>
                      <p className="text-xs text-slate-600">Equipe brasileira disponível no WhatsApp para tirar dúvidas antes e pós-compra.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'especificacoes' && (
                <div className="space-y-4 text-sm">
                  <h4 className="font-bold text-slate-900">Diferenciais e Compromissos da JS Variedades:</h4>
                  <ul className="space-y-2.5 text-slate-700">
                    <li className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Garantia Legal de 90 Dias:</strong> Cobertura completa contra qualquer defeito de fabricação.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Rastreamento em Tempo Real:</strong> Notificações por e-mail e WhatsApp a cada etapa do envio.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Pagamento Protegido Mercado Pago:</strong> Seus dados financeiros nunca são compartilhados com a loja.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RefreshCw className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Política de 7 Dias para Trocas e Devoluções:</strong> Direito de arrependimento respeitado sem burocracia.</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'avaliacoes' && (
                <div className="space-y-6">
                  
                  {/* Resumo de Avaliações */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black text-slate-900">{product.rating || 4.9}</span>
                      <div>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-xs text-slate-600 font-medium">Classificação geral de satisfação</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                      99.4% dos clientes recomendam este produto
                    </span>
                  </div>

                  {/* Lista de Avaliações */}
                  <div className="space-y-3">
                    {reviews.map((rev, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">{rev.author}</span>
                            <span className="text-[10px] text-slate-400">({rev.location})</span>
                            {rev.verified && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Comprador Verificado
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* PRODUTOS RELACIONADOS */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Quem comprou este produto também viu:
              </h2>
              <button
                onClick={() => navigateTo('/')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Ver catálogo completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map(rel => {
                const relPrice = rel.price ?? rel.priceDiscount ?? 0;
                const relImg = rel.image || rel.imageUrl || '';
                return (
                  <div
                    key={rel.id}
                    onClick={() => navigateTo(getProductUrl(rel))}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all p-3 flex flex-col justify-between cursor-pointer group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={relImg}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {rel.title}
                      </h4>
                      <p className="font-black text-blue-700 font-mono text-sm mt-1">
                        R$ {relPrice.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
