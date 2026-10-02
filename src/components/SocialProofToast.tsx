import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { liveSalesEvents } from '../data/initialProducts';
import { Product } from '../types';

interface SocialProofToastProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SocialProofToast: React.FC<SocialProofToastProps> = ({
  products,
  onSelectProduct
}) => {
  const [currentEvent, setCurrentEvent] = useState<{
    name: string;
    city: string;
    productTitle: string;
    time: string;
    productObj?: Product;
  } | null>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let index = 0;

    const showNext = () => {
      if (liveSalesEvents.length === 0 || products.length === 0) return;

      const event = liveSalesEvents[index % liveSalesEvents.length];
      const matched = products.find(p => p.title.toLowerCase().includes(event.product.toLowerCase().slice(0, 8))) || products[index % products.length];

      setCurrentEvent({
        name: event.name,
        city: event.city,
        productTitle: matched.title,
        time: event.time,
        productObj: matched
      });

      setVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setVisible(false);
      }, 5000);

      index++;
    };

    // First trigger after 3 seconds
    const initialTimeout = setTimeout(showNext, 3000);

    // Then interval every 12 seconds
    const interval = setInterval(showNext, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [products]);

  if (!visible || !currentEvent) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-40 max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-slate-200/90 flex items-center gap-3 animate-slideUp">
      {/* Product Image */}
      {currentEvent.productObj && (
        <img
          src={currentEvent.productObj.image}
          alt={currentEvent.productTitle}
          className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0 cursor-pointer"
          onClick={() => currentEvent.productObj && onSelectProduct(currentEvent.productObj)}
        />
      )}

      {/* Text Info */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Compra verificada {currentEvent.time}</span>
        </div>
        <p className="text-xs text-slate-800 font-medium truncate mt-0.5">
          <strong className="text-slate-900 font-bold">{currentEvent.name}</strong> ({currentEvent.city})
        </p>
        <p 
          className="text-[11px] text-blue-600 font-semibold truncate cursor-pointer hover:underline"
          onClick={() => currentEvent.productObj && onSelectProduct(currentEvent.productObj)}
        >
          {currentEvent.productTitle}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => setVisible(false)}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
        title="Dispensar"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
