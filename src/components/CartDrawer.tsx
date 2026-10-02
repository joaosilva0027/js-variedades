import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Truck, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { CartItem } from '../types';
import { Logo } from './Logo';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (appliedDiscountPercent: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);
  const pixTotal = total * 0.95;

  const freeShippingThreshold = 79.00;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'PRIMEIRACOMPRA') {
      setDiscountPercent(10);
      setCouponFeedback('Cupom de 10% aplicado com sucesso!');
    } else if (clean === 'JSVIP') {
      setDiscountPercent(15);
      setCouponFeedback('Cupom VIP de 15% aplicado!');
    } else {
      setCouponFeedback('Cupom inválido ou expirado. Tente: PRIMEIRACOMPRA');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <Logo size="xs" variant="dark" showTagline={false} />
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-sm sm:text-base text-slate-800">
                  Carrinho ({cartItems.reduce((a, b) => a + b.quantity, 0)})
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-blue-50/70 p-3.5 border-b border-blue-100 text-xs">
            <div className="flex items-center justify-between font-semibold text-blue-900 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                {missingForFreeShipping <= 0 ? (
                  <strong className="text-emerald-700">Parabéns! Você ganhou Frete Grátis 🎉</strong>
                ) : (
                  <span>
                    Faltam <strong>R$ {missingForFreeShipping.toFixed(2).replace('.', ',')}</strong> para Frete Grátis
                  </span>
                )}
              </span>
              <span className="text-[10px] text-blue-600 font-bold">{Math.round(progressToFreeShipping)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Seu carrinho está vazio</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Aproveite as ofertas relâmpago de hoje com até 60% de desconto e frete grátis!
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md hover:bg-blue-700 transition-colors"
                >
                  Ver Produtos em Oferta
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item.product.id}
                  className="flex gap-3 p-3 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm relative group"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-cover rounded-xl bg-slate-100 flex-shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                        {item.product.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {item.product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="font-extrabold text-blue-700 text-sm sm:text-base font-mono">
                        R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition-colors self-start"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cupom de desconto"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full text-xs uppercase bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-2 outline-none focus:border-blue-600 font-mono font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Aplicar
                </button>
              </form>

              {couponFeedback && (
                <div className={`text-[11px] font-medium p-1.5 rounded-lg text-center ${
                  discountPercent > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {couponFeedback}
                </div>
              )}

              {/* Order Cost Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Desconto ({discountPercent}%)</span>
                    <span className="font-mono">- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    Frete Brasil
                  </span>
                  <span>GRÁTIS</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total</span>
                  <span className="font-mono text-lg text-blue-700">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>

                {/* PIX Special Price */}
                <div className="text-[11px] text-center bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200 font-medium">
                  💰 Pague apenas <strong className="font-bold font-mono">R$ {pixTotal.toFixed(2).replace('.', ',')}</strong> à vista no PIX (5% OFF)
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                onClick={() => onProceedToCheckout(discountPercent)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all"
              >
                <span>Finalizar Pedido Agora</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Checkout 100% Blindado
                </span>
                <span>•</span>
                <span>Entrega Garantida Correios</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
