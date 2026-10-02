import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Truck, 
  Star, 
  ArrowRight, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Product } from '../types';
import { Logo } from './Logo';

interface HeroBannerProps {
  featuredProduct: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onScrollToDeals: () => void;
  onScrollToCatalog: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredProduct,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onScrollToDeals,
  onScrollToCatalog
}) => {
  const heroImg = featuredProduct.image || featuredProduct.imageUrl || '';
  const heroPrice = featuredProduct.price ?? featuredProduct.priceDiscount ?? 0;
  const heroOriginalPrice = featuredProduct.originalPrice ?? featuredProduct.priceOriginal ?? heroPrice;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#061224] via-[#0b1e3b] to-[#040c19] text-white py-12 md:py-16 border-b border-blue-950">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline and Pitch */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-medium backdrop-blur-md shadow-inner">
              <Logo size="xs" variant="light" showText={false} />
              <span className="font-bold text-white tracking-wide">JS VARIEDADES</span>
              <span className="text-blue-400/60">•</span>
              <span className="text-blue-200">LOJA OFICIAL VIRAL</span>
              <span className="hidden sm:inline bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                Até 60% OFF
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-slate-50">
              Achadinhos & Produtos Virais com{' '}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
                Frete Grátis e Envio Imediato
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Os itens mais desejados das redes sociais selecionados a dedo. Qualidade premium, garantia incondicional de 7 dias e entrega rápida com código de rastreamento oficial dos Correios.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onScrollToDeals}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                <span>Ofertas Relâmpago ⚡</span>
              </button>

              <button
                onClick={onScrollToCatalog}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-base border border-slate-700 hover:border-slate-600 transition-all"
              >
                <span>Explorar Todos os Produtos</span>
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </button>
            </div>

            {/* Trust Counters */}
            <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 sm:gap-6 text-center lg:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 justify-center lg:justify-start">
                <div className="p-2 rounded-lg bg-blue-500/10 text-amber-400 mx-auto sm:mx-0 w-fit">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base text-white">4.9 / 5.0</div>
                  <div className="text-[11px] text-slate-400">+45.000 Clientes</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 justify-center lg:justify-start">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mx-auto sm:mx-0 w-fit">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base text-white">Frete Grátis</div>
                  <div className="text-[11px] text-slate-400">Todo o Brasil</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 justify-center lg:justify-start">
                <div className="p-2 rounded-lg bg-blue-500/10 text-emerald-400 mx-auto sm:mx-0 w-fit">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base text-white">7 Dias</div>
                  <div className="text-[11px] text-slate-400">Garantia Total</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Spotlight Card (Viral Deal Highlight) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl">
              
              {/* Card Header Tag */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Logo size="xs" variant="light" showText={false} />
                  <span>Destaque Exclusivo JS</span>
                </span>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  -{featuredProduct.discountPercent}% OFF
                </span>
              </div>

              {/* Product Visual */}
              <div 
                className="mt-4 relative group cursor-pointer overflow-hidden rounded-xl bg-slate-800 aspect-square"
                onClick={() => onSelectProduct(featuredProduct)}
              >
                <img
                  src={heroImg}
                  alt={featuredProduct.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

                {/* Floating stock alert badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {featuredProduct.stockStatus}
                  </span>
                  <span className="text-amber-400 font-bold">Últimas peças</span>
                </div>
              </div>

              {/* Details & Price */}
              <div className="mt-4 space-y-2">
                <h3 
                  className="font-bold text-slate-100 text-base line-clamp-2 hover:text-blue-300 transition-colors cursor-pointer"
                  onClick={() => onSelectProduct(featuredProduct)}
                >
                  {featuredProduct.title}
                </h3>

                {/* Star Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {featuredProduct.rating} ({featuredProduct.reviewsCount} avaliações)
                  </span>
                </div>

                {/* Price block */}
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through">
                    De: R$ {heroOriginalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    Por: R$ {heroPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  {featuredProduct.installments} ou à vista com 5% de desconto no PIX
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onBuyNow ? onBuyNow(featuredProduct) : onAddToCart(featuredProduct)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-98 transition-all"
                  title="Comprar com Mercado Pago"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Comprar Agora</span>
                </button>

                <button
                  onClick={() => onAddToCart(featuredProduct)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>+ Carrinho</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
