import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  PhoneCall, 
  ShieldCheck, 
  Truck, 
  X,
  Sparkles
} from 'lucide-react';
import { CartItem } from '../types';
import { Logo } from './Logo';
import { navigateTo } from '../utils/navigation';

interface HeaderProps {
  cartItems: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItems,
  setIsCartOpen,
  searchQuery,
  setSearchQuery,
  favoritesCount,
  onOpenFavorites
}) => {
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs transition-all border-b border-slate-100 w-full overflow-hidden">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white text-xs py-1.5 sm:py-2 px-3 sm:px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Truck className="w-3.5 h-3.5 text-blue-200" />
            <span>FRETE GRÁTIS PARA TODO O BRASIL HOJE</span>
          </div>

          <div className="flex-1 sm:flex-none text-center sm:text-right font-semibold flex items-center justify-center sm:justify-end gap-2 sm:gap-3 text-[10px] sm:text-xs">
            <span className="bg-white/15 px-2 py-0.5 rounded text-amber-300 font-mono tracking-wide">
              CUPOM: PRIMEIRACOMPRA (10% OFF)
            </span>
            <span className="hidden md:inline text-blue-200">•</span>
            <span className="hidden md:inline text-blue-100">5% OFF EXTRA NO PIX</span>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 w-full">
        
        {/* Linha 1: No mobile: Logo à esquerda e Carrinho à direita (justify-between items-center). No Desktop: Logo + Busca central + Ações */}
        <div className="flex items-center justify-between gap-2 sm:gap-6 w-full">
          
          {/* Brand Logo - shrink-0 */}
          <a 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/');
            }}
            className="flex items-center group shrink-0 cursor-pointer select-none" 
            title="JS Variedades - Início"
          >
            <Logo size="md" variant="dark" showText={true} showTagline={true} />
          </a>

          {/* Desktop Search Bar (visível a partir de sm, oculto no mobile) */}
          <div className="hidden sm:block flex-1 max-w-xl mx-2 lg:mx-4 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="O que você está procurando hoje? (ex: seladora, smartwatch...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-full pl-10 pr-10 py-2.5 transition-all border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons - shrink-0 com margem e espaçamento garantidos */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* WhatsApp Support Button (apenas telas grandes) */}
            <a
              href="https://wa.me/5543998396210?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida%20sobre%20meu%20pedido%20na%20JS%20Variedades"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
              title="Atendimento no WhatsApp: (43) 99839-6210"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Suporte</span>
            </a>

            {/* Favorites Button */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 sm:p-2.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Meus Favoritos"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart Trigger Button - shrink-0 absoluto, nunca cortado nem espremido */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 sm:gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 sm:pl-3.5 sm:pr-4 py-2 sm:py-2.5 rounded-full shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer select-none"
              title="Abrir Carrinho"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 font-black text-[10px] sm:text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce ring-2 ring-white sm:ring-transparent">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-blue-100 uppercase font-semibold">Meu Carrinho</span>
                <span className="text-xs font-bold font-mono">
                  {cartSubtotal > 0 ? `R$ ${cartSubtotal.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                </span>
              </div>
            </button>

          </div>

        </div>

        {/* Linha 2 (Mobile Only): Campo de busca em linha própria ocupando a largura total sem empurrar o carrinho */}
        <div className="block sm:hidden w-full mt-2.5 relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="O que você está procurando hoje? (ex: fone...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 text-xs rounded-full pl-9 pr-9 py-2 transition-all border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
