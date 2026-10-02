import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  PhoneCall, 
  Mail, 
  MapPin, 
  Sparkles,
  Heart
} from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      
      {/* Top Banner inside footer */}
      <div className="border-b border-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Entrega para todo o Brasil</h5>
              <p className="text-slate-400 text-xs">Parceria oficial com os Correios e Transportadoras</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Garantia Incondicional</h5>
              <p className="text-slate-400 text-xs">7 dias para testar ou seu dinheiro 100% de volta</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Ambiente 100% Seguro</h5>
              <p className="text-slate-400 text-xs">Certificado SSL 256 bits com proteção total de dados</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <Logo size="lg" variant="light" showText={true} showTagline={true} />
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto md:mx-0">
              A JS Variedades é a sua loja online de confiança para encontrar os produtos virais mais desejados da internet, utilidades domésticas inovadoras, eletrônicos inteligentes e itens de bem-estar com os melhores preços do Brasil.
            </p>

            <div className="space-y-2 text-xs text-slate-400">
              <a
                href="https://wa.me/5543998396210?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida%20sobre%20meu%20pedido%20na%20JS%20Variedades"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-2 hover:text-emerald-400 transition-colors group"
                title="Conversar no WhatsApp"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>WhatsApp: <strong className="text-slate-200">(43) 99839-6210</strong> (Seg à Sex, 9h às 18h)</span>
              </a>
              <a
                href="mailto:strideshopofc@gmail.com"
                className="flex items-center justify-center md:justify-start gap-2 hover:text-blue-300 transition-colors group"
                title="Enviar E-mail"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>E-mail: <strong className="text-slate-200">strideshopofc@gmail.com</strong></span>
              </a>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Atendimento Nacional • Brasil</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-center md:text-left">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Departamentos</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#ofertas-relampago" className="hover:text-white transition-colors">Ofertas Relâmpago ⚡</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cozinha & Casa</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Eletrônicos & Smart</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Organização Prática</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Iluminação & Decoração</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Automotivo & Acessórios</a></li>
            </ul>
          </div>

          {/* Institutional */}
          <div className="space-y-3 text-center md:text-left">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Institucional</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Sobre a JS Variedades</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Frete e Prazos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trocas, Devoluções e Reembolso</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade (LGPD)</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso e Serviço</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Rastrear Meu Pedido</a></li>
            </ul>
          </div>

          {/* Payments & Security Badges */}
          <div className="space-y-3 text-center md:text-left">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Formas de Pagamento</h4>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-white font-mono font-bold text-[10px] text-emerald-400">
                PIX (5% OFF)
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-200 font-bold text-[10px]">
                VISA
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-200 font-bold text-[10px]">
                MASTERCARD
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-200 font-bold text-[10px]">
                ELO
              </span>
              <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-200 font-bold text-[10px]">
                BOLETO
              </span>
            </div>

            <div className="pt-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Selos de Segurança</h4>
              <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Site 100% Criptografado SSL</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits & CNPJ */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} JS Variedades Comércio Digital Ltda. CNPJ: 48.912.834/0001-92. Todos os direitos reservados.
          </p>

          <p className="flex items-center gap-1 justify-center">
            Desenvolvido com excelência para alta conversão e experiência de compra premium.
          </p>
        </div>

      </div>

    </footer>
  );
};
