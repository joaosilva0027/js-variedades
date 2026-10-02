import React from 'react';
import { 
  Truck, 
  ShieldCheck, 
  CreditCard, 
  Headphones, 
  Star, 
  CheckCircle, 
  Sparkles,
  Award
} from 'lucide-react';
import { customerTestimonials } from '../data/initialProducts';

export const TrustAndReviews: React.FC = () => {
  return (
    <section className="py-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges 4 Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-12 border-b border-slate-100">
          
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 flex-shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Frete Grátis Brasil</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Envio com código de rastreamento oficial dos Correios.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
            <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Garantia 7 Dias</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Satisfação 100% garantida ou devolução total do seu dinheiro.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 flex-shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">Pagamento Seguro</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                PIX com 5% de desconto ou em até 12x no cartão.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/5543998396210?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida%20sobre%20meu%20pedido%20na%20JS%20Variedades"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors group cursor-pointer"
            title="Fale conosco no WhatsApp: (43) 99839-6210"
          >
            <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex-shrink-0">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-emerald-700 transition-colors">Suporte Humanizado</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Atendimento no WhatsApp: (43) 99839-6210 (Seg à Sex, 9h às 18h).
              </p>
            </div>
          </a>

        </div>

        {/* Customer Testimonials Section */}
        <div className="pt-12">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Avaliações Reais de Clientes</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mais de 45.000 clientes satisfeitos em todo o Brasil
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Veja o que nossos clientes dizem após receberem seus produtos em casa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {customerTestimonials.map((review) => (
              <div
                key={review.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Rating Stars & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-400">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{review.date}</span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{review.comment}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                    <div>
                      <h5 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                        {review.name}
                      </h5>
                      <span className="text-[10px] text-slate-500">{review.city}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Compra Verificada
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
