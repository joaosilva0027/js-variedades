import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { Logo } from './Logo';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onAddToCart,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <Logo size="xs" variant="dark" showTagline={false} />
            <div className="h-4 w-px bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Meus Favoritos ({favorites.length})
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Heart className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Você ainda não salvou nenhum produto.</p>
              <p className="text-xs text-slate-500">Clique no ícone de coração nos produtos para salvar seus achadinhos favoritos!</p>
            </div>
          ) : (
            favorites.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-100 cursor-pointer"
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                />

                <div className="flex-1 min-w-0">
                  <h4 
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="text-xs font-bold text-slate-800 truncate hover:text-blue-600 cursor-pointer"
                  >
                    {product.title}
                  </h4>
                  <div className="font-extrabold text-blue-700 text-sm font-mono mt-0.5">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </div>
                  <span className="text-[10px] text-slate-400 line-through">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
                    title="Adicionar ao Carrinho"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveFavorite(product)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
