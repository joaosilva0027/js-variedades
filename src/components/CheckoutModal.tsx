import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Truck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ExternalLink,
  CreditCard,
  QrCode,
  Barcode
} from 'lucide-react';
import { CartItem } from '../types';
import { Logo } from './Logo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountPercent: number;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountPercent,
  onOrderCompleted
}) => {
  if (!isOpen) return null;

  // Form fields: ONLY Nome, WhatsApp, E-mail, Endereço
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  // Phone input mask (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    
    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setPhone(val);
  };

  // Totals calculation
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);
  const pixPrice = total * 0.95;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu Nome Completo.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Por favor, informe um WhatsApp válido com DDD.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um E-mail válido para receber a confirmação.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Por favor, informe seu Endereço Completo para entrega.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: cartItems.map(item => ({
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          unit_price: item.product.price,
          quantity: item.quantity,
          image: item.product.image || item.product.imageUrl,
          category: item.product.category,
          description: item.product.description
        })),
        payer: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim()
        },
        discountPercent
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível gerar a preferência de pagamento.');
      }

      const targetUrl = data.init_point || data.sandbox_init_point;

      if (!targetUrl) {
        throw new Error('Link de checkout do Mercado Pago não retornado pela API.');
      }

      setRedirectUrl(targetUrl);
      onOrderCompleted();

      // Attempt automatic redirect
      setTimeout(() => {
        try {
          if (window.top && window.top !== window) {
            window.top.location.href = targetUrl;
          } else {
            window.location.href = targetUrl;
          }
        } catch {
          window.location.href = targetUrl;
        }
      }, 900);

    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Erro ao conectar ao Mercado Pago. Verifique sua conexão e tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Logo size="xs" variant="light" showTagline={false} />
            <div className="h-4 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Checkout Pro Mercado Pago</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Sub-header Banner */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-emerald-50 px-5 py-2.5 border-b border-blue-100 flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ambiente 100% Criptografado</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Frete Grátis Ativado</span>
          </div>
        </div>

        {/* Redirecting Screen */}
        {redirectUrl ? (
          <div className="p-8 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-600 mx-auto flex items-center justify-center shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Conectando ao Mercado Pago
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Redirecionando para o Pagamento Seguro...
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Você será levado ao ambiente oficial do Mercado Pago para escolher entre <strong>PIX</strong>, <strong>Cartão até 12x</strong> ou <strong>Boleto</strong>.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={redirectUrl}
                target="_top"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Clique aqui se não redirecionar automaticamente</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* Form Content */
          <div className="p-5 sm:p-6 overflow-y-auto max-h-[80vh] space-y-5">
            
            {/* Products Summary Mini Box */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Resumo do Pedido ({cartItems.reduce((a, b) => a + b.quantity, 0)} {cartItems.reduce((a, b) => a + b.quantity, 0) === 1 ? 'item' : 'itens'})</span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">Frete Grátis</span>
              </div>

              {/* Items List (max 3 displayed) */}
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2.5 text-xs">
                    <img 
                      src={item.product.image || item.product.imageUrl} 
                      alt={item.product.title} 
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{item.product.title}</p>
                      <p className="text-[11px] text-slate-500">Qtd: {item.quantity} × R$ {item.product.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <span className="font-bold font-mono text-slate-800">
                      R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Totals */}
              <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500">Total a Pagar:</span>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    ou R$ {pixPrice.toFixed(2).replace('.', ',')} no PIX (5% OFF)
                  </div>
                </div>
                <span className="text-2xl font-black text-blue-700 font-mono">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Fast Form with ONLY 4 Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>1. Nome Completo</span>
                  <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>2. WhatsApp</span>
                    <span className="text-[10px] text-slate-400 font-normal">Com DDD</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>3. E-mail</span>
                    <span className="text-[10px] text-slate-400 font-normal">Para confirmação</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>4. Endereço Completo de Entrega</span>
                  <span className="text-[10px] text-slate-400 font-normal">Rua, nº, bairro e cidade</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Av. Paulista, 1000, Apto 42, Bela Vista - São Paulo/SP - CEP 01310-100"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-white focus:bg-white text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Mercado Pago Payment Methods Badges */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 text-[11px] text-slate-600 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800 text-xs">
                  <span>Formas aceitas no Mercado Pago:</span>
                  <span className="text-sky-600 font-extrabold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                    Checkout Pro Oficial
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-700">
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex flex-col items-center gap-0.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PIX Instantâneo</span>
                    <strong className="text-[9px] text-emerald-600">5% OFF</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex flex-col items-center gap-0.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cartão de Crédito</span>
                    <strong className="text-[9px] text-blue-600">Até 12x</strong>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex flex-col items-center gap-0.5">
                    <Barcode className="w-3.5 h-3.5 text-slate-600" />
                    <span>Boleto Bancário</span>
                    <strong className="text-[9px] text-slate-500">Qualquer banco</strong>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Conectando ao Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-emerald-200" />
                    <span>Ir para Pagamento Seguro Mercado Pago</span>
                    <ArrowRight className="w-4 h-4 text-emerald-200" />
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Garantia incondicional de 7 dias com devolução 100% garantida</span>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
