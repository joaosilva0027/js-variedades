import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Plus, 
  Minus, 
  Check, 
  Zap,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Product } from '../types';
import { Logo } from './Logo';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onInstantBuy: (product: Product, quantity: number) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onInstantBuy
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState('');
  const [shippingResult, setShippingResult] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const modalPrice = product.price ?? product.priceDiscount ?? 0;
  const modalOriginalPrice = product.originalPrice ?? product.priceOriginal ?? modalPrice;
  const modalImg = product.image || product.imageUrl || '';
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [modalImg];
  const savings = modalOriginalPrice - modalPrice;
  const pixPrice = modalPrice * 0.95;

  const handleSimulateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (cep.length >= 8) {
      setShippingResult('Frete Grátis • Entrega expressa em 3 a 6 dias úteis com rastreamento Correios');
    }
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images Gallery */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-inner">
            <img
              src={images[activeImageIndex] || modalImg}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className="bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                -{product.discountPercent}% OFF
              </span>
              <span className="bg-emerald-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                Envio Imediato
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100 scale-95' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Guarantees */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Garantia de 7 dias ou seu dinheiro de volta</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Rastreamento em tempo real nos Correios</span>
            </div>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 p-5 sm:p-7 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="font-bold text-slate-800">{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount} avaliações)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {product.title}
            </h2>

            {/* Stock alert & Official Seller */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{product.stockStatus}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                <Logo size="xs" variant="dark" showText={false} />
                <span>Loja Oficial JS</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-xs text-slate-400 line-through">
                De: R$ {modalOriginalPrice.toFixed(2).replace('.', ',')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono">
                  Por: R$ {modalPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Economia de R$ {savings.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="text-xs text-emerald-800 font-medium pt-1">
                Ou <strong className="font-bold font-mono">R$ {pixPrice.toFixed(2).replace('.', ',')}</strong> à vista no PIX (5% de desconto extra)
              </div>
              <div className="text-xs text-slate-500">
                {product.installments}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Descrição do Produto
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Shipping Calculator */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-white">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Calcular Frete e Prazo
                </span>
                <span className="text-emerald-600 font-bold">Frete Grátis</span>
              </div>

              <form onSubmit={handleSimulateShipping} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite seu CEP (ex: 01001-000)"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  maxLength={9}
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  Calcular
                </button>
              </form>

              {shippingResult && (
                <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium">
                  {shippingResult}
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-semibold text-slate-700">Quantidade:</span>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-slate-100 text-slate-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-slate-100 text-slate-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
            <button
              onClick={() => onInstantBuy(product, quantity)}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Comprar Agora • Checkout Seguro</span>
            </button>

            <button
              onClick={handleAdd}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                isAdded 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Item Adicionado ao Carrinho!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <span>Adicionar ao Carrinho</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
