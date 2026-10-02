import React, { useState } from 'react';
import { PhoneCall, X, MessageCircle } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end">
      
      {/* Floating speech bubble */}
      {showTooltip && (
        <div className="mb-2 bg-white text-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-200 text-xs max-w-[220px] relative animate-bounce">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -right-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full p-0.5"
            title="Fechar"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="font-bold text-emerald-700 flex items-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            Atendimento Online
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Dúvidas sobre produtos ou frete? Fale com a gente no WhatsApp!
          </p>
        </div>
      )}

      {/* Button */}
      <a
        href="https://wa.me/5543998396210?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida%20sobre%20meu%20pedido%20na%20JS%20Variedades"
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-emerald-500/40 transition-all transform hover:scale-105 active:scale-95 group relative"
        title="Falar no WhatsApp: (43) 99839-6210"
      >
        <span className="absolute -top-1 -left-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" />
      </a>
    </div>
  );
};
