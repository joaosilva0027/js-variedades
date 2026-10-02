import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Qual é o prazo de entrega dos produtos?",
      a: "O prazo médio de entrega para capitais e regiões metropolitanas é de 3 a 7 dias úteis. Para demais cidades do interior, o prazo varia entre 5 a 10 dias úteis. Todos os pedidos contam com código de rastreamento oficial dos Correios enviado para seu e-mail e WhatsApp."
    },
    {
      q: "O frete é realmente grátis para todo o Brasil?",
      a: "Sim! Na JS Variedades oferecemos Frete Grátis promocional para qualquer cidade do território nacional em todos os produtos do catálogo nesta campanha especial."
    },
    {
      q: "Como recebo o código de rastreamento do meu pedido?",
      a: "Assim que seu pagamento for confirmado e o pacote despachado no centro de distribuição (em até 24h úteis), você receberá automaticamente o código de rastreio por e-mail e WhatsApp para acompanhar cada etapa da entrega."
    },
    {
      q: "Quais são as formas de pagamento disponíveis?",
      a: "Aceitamos PIX (com 5% de desconto imediato e compensação instantânea), Cartão de Crédito (Visa, Mastercard, Elo, American Express, Hipercard) em até 12x, e Boleto Bancário. Todas as transações são 100% blindadas e protegidas por criptografia SSL."
    },
    {
      q: "Como funciona a garantia de 7 dias?",
      a: "Se você não ficar 100% satisfeito com o produto ou houver qualquer defeito de fabricação, você tem até 7 dias corridos após o recebimento para solicitar a troca ou o reembolso integral do valor pago, sem burocracia, pelo nosso canal oficial de suporte."
    }
  ];

  return (
    <section className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-8 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Tire Suas Dúvidas</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Perguntas Frequentes (FAQ)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Encontre respostas rápidas para as principais dúvidas sobre pedidos e entregas.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'transform rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
