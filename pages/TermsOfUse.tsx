
import React from 'react';
/* Added missing Check icon import */
import { FileText, Scale, ShieldCheck, ArrowLeft, Mail, Phone, AlertCircle, Check, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUse: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20 font-brand selection:bg-[#1c2d51] selection:text-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-[#1c2d51] transition-all">
            <ArrowLeft size={16} /> Voltar ao Início
          </Link>
          <Link to="/termos-saas" className="inline-flex items-center gap-2 bg-slate-50 text-[#1c2d51] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1c2d51] hover:text-white transition-all shadow-sm border border-slate-100">
            <Globe size={14} /> Termo de Uso - SaaS White-Label
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-[#357fb2] rounded-2xl flex items-center justify-center">
            <Scale size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter">Termos de Uso</h1>
        </div>

        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12 border-b border-slate-100 pb-8">
          Última Atualização: {new Date().toLocaleDateString('pt-PT')} • ImoSuite SaaS
        </p>

        <div className="prose prose-slate max-w-none space-y-12">
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex gap-6 items-start">
             <AlertCircle className="text-[#357fb2] shrink-0" size={24}/>
             <p className="text-sm font-bold text-slate-600 leading-relaxed">
               Ao utilizar a plataforma Imosuite, o utilizador declara que leu, compreendeu e aceita integralmente estes termos. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços.
             </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">01.</span> Objeto
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Os presentes Termos de Uso regulam o acesso e utilização da plataforma Imosuite, propriedade da <strong>Moderno e Peculiar Unip. Lda</strong>. A plataforma funciona como um ecossistema digital para gestão imobiliária e criação de portais white-label.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">02.</span> Condições de Acesso
            </h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] space-y-4 text-slate-600 font-medium">
              <p>O utilizador compromete-se expressamente a:</p>
              <ul className="space-y-3 list-none p-0">
                <li className="flex gap-3"><Check size={16} className="text-emerald-500 shrink-0 mt-1"/> Fornecer informações verdadeiras, exatas e atualizadas em todos os formulários.</li>
                <li className="flex gap-3"><Check size={16} className="text-emerald-500 shrink-0 mt-1"/> Manter a estrita confidencialidade das suas credenciais de acesso (email e palavra-passe).</li>
                <li className="flex gap-3"><Check size={16} className="text-emerald-500 shrink-0 mt-1"/> Utilizar a plataforma exclusivamente para fins legais e profissionais.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">03.</span> Utilização da Plataforma
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">É expressamente proibido ao utilizador:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Utilizar a plataforma para fins ilícitos",
                "Tentar aceder a áreas não autorizadas",
                "Introduzir código malicioso ou vírus",
                "Violar direitos de propriedade de terceiros"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-red-50/30 border border-red-100/50 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                  <span className="text-xs font-bold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">04.</span> Responsabilidade do Utilizador
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              O utilizador é o <strong>único responsável</strong> pelos dados, imagens e textos inseridos na plataforma, incluindo dados pessoais de terceiros (leads e clientes). Garante, ao utilizar o serviço, que possui a base legal necessária para o respetivo tratamento de dados nos termos do RGPD.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">05.</span> Propriedade Intelectual
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Todo o conteúdo, software, marcas, algoritmos de IA e funcionalidades da Imosuite são propriedade exclusiva da <strong>Moderno e Peculiar Unip. Lda</strong> ou dos seus licenciadores. O uso da plataforma concede apenas uma licença de uso limitada e revogável, não transferindo qualquer direito de propriedade.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">06.</span> Limitação de Responsabilidade
            </h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] text-slate-600 leading-relaxed font-medium space-y-3 text-sm">
              <p>A Imosuite e a Moderno e Peculiar Unip. Lda não se responsabilizam por:</p>
              <ul className="space-y-2">
                <li>Interrupções temporárias do serviço para manutenção ou falhas técnicas externas.</li>
                <li>Perdas de negócio decorrentes do uso indevido da plataforma.</li>
                <li>Veracidade ou legalidade dos conteúdos inseridos pelos utilizadores finais.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">07.</span> Suspensão ou Cancelamento
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              A empresa reserva-se o direito de suspender ou cancelar o acesso a contas que violem estes termos, sem aviso prévio, especialmente em casos de fraude ou uso abusivo de recursos tecnológicos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">08.</span> Alterações aos Termos
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Estes Termos de Uso podem ser atualizados periodicamente. A continuação da utilização da plataforma após a publicação de alterações constitui aceitação das mesmas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">09.</span> Lei Aplicável e Foro
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Os presentes Termos regem-se pela <strong>lei portuguesa</strong>. Para a resolução de qualquer litígio, é competente o foro da comarca da sede da empresa, com renúncia expressa a qualquer outro.
            </p>
          </section>

          <section className="space-y-6 pt-12 border-t border-slate-100">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">10.</span> Contacto
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1c2d51] shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Suporte e Dados</p>
                  <p className="font-bold text-[#1c2d51]">dados@imosuite.pt</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1c2d51] shadow-sm">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Linha Direta</p>
                  <p className="font-bold text-[#1c2d51]">+351 918 152 116</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-12 text-center">
            <ShieldCheck className="mx-auto text-slate-200 mb-6" size={48}/>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed max-w-lg mx-auto">
              ImoSuite SaaS • Uma solução tecnológica da Moderno e Peculiar Unip. Lda
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
