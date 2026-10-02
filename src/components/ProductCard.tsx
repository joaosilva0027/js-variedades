import React, { useState } from 'react';
import { 
  Star, 
  ShoppingBag, 
  Eye, 
  Heart, 
  Check, 
  Truck, 
  Zap 
} from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  isFavorite,
  onToggleFavorite
}) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const displayPrice = product.price ?? product.priceDiscount ?? 0;
  const displayOriginalPrice = product.originalPrice ?? product.priceOriginal ?? displayPrice;
  const displayImage = product.image || product.imageUrl || '';
  const badgesList = product.badges && product.badges.length > 0
    ? product.badges
    : (product.badge ? [product.badge] : []);
  const pixPrice = displayPrice * 0.95;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden relative">
      
      {/* Top Floating Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        <span className="bg-blue-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
          -{product.discountPercent}% OFF
        </span>
        {badgesList.map((badge, idx) => (
          <span 
            key={idx}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
              badge.includes('Mais Vendido') 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-slate-900 text-white'
            }`}
          >
            {badge}
          </span>
        ))}
      </div>

      {/* Wishlist Heart Button */}
      <button
        onClick={() => onToggleFavorite(product)}
        className="absolute top-2.5 right-2.5 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 shadow-sm transition-all"
        title={isFavorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
      >
        <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <div 
        className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={displayImage}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

        {/* Quick View Pill on Hover */}
        <div className="absolute bottom-2.5 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="w-full py-2 bg-white/95 backdrop-blur-sm hover:bg-white text-slate-800 text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Espiar Detalhes</span>
          </button>
        </div>
      </div>

      {/* Product Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          
          {/* Category */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>{product.category}</span>
            {product.freeShipping && (
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <Truck className="w-3 h-3" />
                Frete Grátis
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer leading-snug"
          >
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="font-bold text-slate-700 text-xs">{product.rating}</span>
            <span className="text-[10px] text-slate-400">({product.reviewsCount} avaliações)</span>
          </div>

          {/* Prices */}
          <div className="pt-2">
            <span className="text-[11px] text-slate-400 line-through block">
              De: R$ {displayOriginalPrice.toFixed(2).replace('.', ',')}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-2xl font-extrabold text-blue-700 font-mono tracking-tight">
                R$ {displayPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
            
            {/* PIX Price Highlight */}
            <div className="mt-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center justify-between">
              <span>no PIX: R$ {pixPrice.toFixed(2).replace('.', ',')}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-800">5% OFF</span>
            </div>

            <span className="text-[10px] text-slate-500 font-medium block mt-1">
              {product.installments}
            </span>
          </div>

          {/* Stock status indicator */}
          <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{product.stockStatus}</span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-2 flex items-center gap-2">
          <button
            onClick={() => onBuyNow ? onBuyNow(product) : handleAdd()}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
            title="Comprar Agora com Mercado Pago"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>Comprar Agora</span>
          </button>

          <button
            onClick={handleAdd}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
              isAdded 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Adicionar ao Carrinho"
          >
            {isAdded ? <Check className="w-4 h-4 text-white" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>

      </div>

    </div>
  );
};
