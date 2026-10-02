import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Flame, 
  Clock, 
  Star, 
  ShoppingBag, 
  Eye, 
  ChevronRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Product } from '../types';
import { getProductUrl } from '../utils/productRoutes';
import { navigateTo } from '../utils/navigation';

interface FlashDealsSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export const FlashDealsSection: React.FC<FlashDealsSectionProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onBuyNow
}) => {
  // Live Countdown Timer state (starts at ~04h 37m 18s)
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 37,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 6, minutes: 0, seconds: 0 }; // reset
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  // Filter flash deal products
  const flashProducts = products.filter(p => p.flashDeal);

  return (
    <section id="ofertas-relampago" className="py-10 bg-gradient-to-b from-amber-500/10 via-slate-50 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Card Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-5 sm:p-7 text-white shadow-lg mb-8 relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute right-1/4 -top-8 w-32 h-32 bg-amber-400/20 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Title & Pitch */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <Flame className="w-4 h-4 fill-amber-300 text-amber-300 animate-bounce" />
                <span>Queima de Estoque Exclusiva</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ofertas Relâmpago ⚡
              </h2>
              <p className="text-rose-100 text-xs sm:text-sm font-medium">
                Descontos de até 60% garantidos enquanto durarem os estoques promocionais.
              </p>
            </div>

            {/* Countdown Clock Display */}
            <div className="bg-slate-950/80 backdrop-blur-md rounded-xl p-3.5 sm:p-4 border border-white/15 flex flex-col sm:items-center shadow-inner">
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                Oferta termina em:
              </span>

              <div className="flex items-center gap-2 font-mono">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div className="bg-slate-800 text-white font-black text-xl sm:text-2xl px-2.5 py-1.5 rounded-lg border border-slate-700 min-w-[42px] text-center shadow">
                    {formatNumber(timeLeft.hours)}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Horas</span>
                </div>

                <span className="text-amber-400 font-black text-xl mb-4">:</span>

                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div className="bg-slate-800 text-white font-black text-xl sm:text-2xl px-2.5 py-1.5 rounded-lg border border-slate-700 min-w-[42px] text-center shadow">
                    {formatNumber(timeLeft.minutes)}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Min</span>
                </div>

                <span className="text-amber-400 font-black text-xl mb-4">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div className="bg-red-600 text-white font-black text-xl sm:text-2xl px-2.5 py-1.5 rounded-lg border border-red-500 min-w-[42px] text-center shadow animate-pulse">
                    {formatNumber(timeLeft.seconds)}
                  </div>
                  <span className="text-[9px] text-rose-300 mt-1 uppercase font-bold">Seg</span>
                </div>
              </div>

            </div>

          </div>

          {/* Scarcity Bar */}
          <div className="mt-5 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span className="font-semibold text-white">
                Status das Vendas: <strong className="text-amber-300">84% dos itens promocionais esgotados</strong>
              </span>
            </div>

            <div className="w-full sm:w-64 bg-black/30 rounded-full h-2.5 overflow-hidden p-0.5">
              <div className="bg-gradient-to-r from-amber-400 to-amber-200 h-full rounded-full transition-all duration-1000" style={{ width: '84%' }} />
            </div>
          </div>

        </div>

        {/* Flash Deals Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {flashProducts.slice(0, 4).map((product) => {
            const pPrice = product.price ?? product.priceDiscount ?? 0;
            const pOriginal = product.originalPrice ?? product.priceOriginal ?? pPrice;
            const pImg = product.image || product.imageUrl || '';
            const savings = pOriginal - pPrice;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-red-400 hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden relative"
              >
                {/* Discount Badge */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                    <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
                    -{product.discountPercent}% OFF
                  </span>
                  {product.freeShipping && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Frete Grátis
                    </span>
                  )}
                </div>

                {/* Quick view button overlay */}
                <button
                  onClick={() => onSelectProduct ? onSelectProduct(product) : navigateTo(getProductUrl(product))}
                  className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 text-slate-700 hover:text-blue-600 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Ver detalhes do produto"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Product Image */}
                <a 
                  href={getProductUrl(product)}
                  className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer block"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSelectProduct) onSelectProduct(product);
                    else navigateTo(getProductUrl(product));
                  }}
                >
                  <img
                    src={pImg}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </a>

                {/* Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    
                    {/* Category */}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {product.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
                      <a 
                        href={getProductUrl(product)}
                        onClick={(e) => {
                          e.preventDefault();
                          if (onSelectProduct) onSelectProduct(product);
                          else navigateTo(getProductUrl(product));
                        }}
                      >
                        {product.title}
                      </a>
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                      </div>
                      <span className="font-bold text-slate-700 text-xs">{product.rating}</span>
                      <span className="text-[10px] text-slate-400">({product.reviewsCount})</span>
                    </div>

                    {/* Prices */}
                    <div className="pt-1.5">
                      <span className="text-[11px] text-slate-400 line-through block">
                        De: R$ {pOriginal.toFixed(2).replace('.', ',')}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-xl font-extrabold text-slate-900 font-mono">
                          R$ {pPrice.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Economize R$ {savings.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                        {product.installments}
                      </span>
                    </div>

                    {/* Stock Urgency Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-rose-600 mb-1">
                        <span>🔥 {product.stockStatus}</span>
                        <span>{product.remainingStock} restando</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full animate-pulse"
                          style={{ width: `${Math.min(100, (product.remainingStock / 30) * 100)}%` }}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Buy Buttons */}
                  <div className="mt-4 pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onBuyNow ? onBuyNow(product) : onAddToCart(product)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98 transition-all"
                      title="Comprar com Mercado Pago"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Comprar Agora</span>
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-all"
                      title="Adicionar ao Carrinho"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
