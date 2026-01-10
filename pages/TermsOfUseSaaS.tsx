
import React from 'react';
import { Scale, ShieldCheck, ArrowLeft, Mail, Phone, AlertCircle, Check, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfUseSaaS: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20 font-brand selection:bg-[#1c2d51] selection:text-white">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/termos" className="inline-flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-[#1c2d51] transition-all mb-12">
          <ArrowLeft size={16} /> Voltar aos Termos Gerais
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-[#357fb2] rounded-2xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter">Termos de Uso <br/><span className="text-[#357fb2]">SaaS White-Label</span></h1>
        </div>

        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12 border-b border-slate-100 pb-8">
          ImoSuite – SaaS White-Label • Moderno e Peculiar Unip. Lda
        </p>

        <div className="prose prose-slate max-w-none space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">01.</span> Objeto
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Os presentes Termos regulam o acesso e utilização da plataforma Imosuite, disponibilizada em modelo SaaS white-label, propriedade da <strong>Moderno e Peculiar Unip. Lda.</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">02.</span> Registo e Conta
            </h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] space-y-4 text-slate-600 font-medium">
              <p>O acesso à plataforma depende de registo efetuado diretamente ou através de um cliente white-label. O utilizador compromete-se a:</p>
              <ul className="space-y-3 list-none p-0">
                <li className="flex gap-3"><Check size={16} className="text-emerald-500 shrink-0 mt-1"/> Manter dados corretos e atualizados.</li>
                <li className="flex gap-3"><Check size={16} className="text-emerald-500 shrink-0 mt-1"/> Garantir confidencialidade das credenciais.</li>
                <li className="flex gap-3"><Check size={16} className="text-emerald-500 shrink-0 mt-1"/> Não partilhar acessos indevidamente.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">03.</span> Responsabilidade dos Clientes White-Label
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">Os clientes que utilizem a Imosuite como white-label são integralmente responsáveis por:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Dados inseridos na plataforma",
                "Relação com os seus utilizadores finais",
                "Conformidade legal do tratamento de dados",
                "Conteúdos e comunicações realizadas"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#357fb2]"></div>
                  <span className="text-xs font-bold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">04.</span> Utilização Permitida
            </h2>
            <div className="p-8 bg-red-50/30 border border-red-100/50 rounded-[2rem] space-y-4 text-slate-600 font-medium">
              <p>É expressamente proibido:</p>
              <ul className="space-y-3 list-none p-0">
                <li className="flex gap-3">Utilizar a plataforma para fins ilícitos.</li>
                <li className="flex gap-3">Introduzir malware ou código malicioso.</li>
                <li className="flex gap-3">Violar direitos de terceiros.</li>
                <li className="flex gap-3">Tentar aceder a dados de outros tenants.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">05.</span> Propriedade Intelectual
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              A plataforma, código-fonte, funcionalidades e tecnologia são propriedade exclusiva da <strong>Moderno e Peculiar Unip. Lda.</strong> O cliente adquire apenas um direito de utilização não exclusivo, não transmissível e limitado à vigência do contrato.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">06.</span> Disponibilidade do Serviço
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              A Imosuite envida esforços para garantir elevada disponibilidade, mas não garante funcionamento ininterrupto. Podem ocorrer manutenções programadas, atualizações técnicas ou interrupções por motivos alheios à empresa.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">07.</span> Limitação de Responsabilidade
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">A Imosuite não é responsável por:</p>
            <ul className="list-disc ml-6 space-y-2 text-slate-600 font-medium">
              <li>Conteúdos inseridos pelos clientes.</li>
              <li>Dados tratados sob instruções do cliente.</li>
              <li>Danos resultantes de uso indevido.</li>
              <li>Perdas indiretas ou lucros cessantes.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">08.</span> Suspensão e Rescisão
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              A empresa pode suspender ou rescindir o acesso em caso de violação destes Termos, utilização abusiva ou incumprimento legal.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">09.</span> Alterações aos Termos
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Os Termos podem ser alterados a qualquer momento. A continuação da utilização implica aceitação.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">10.</span> Lei Aplicável e Foro
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Aplica-se a lei portuguesa, sendo competente o foro legalmente aplicável.
            </p>
          </section>

          <section className="space-y-6 pt-12 border-t border-slate-100">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3">
              <span className="text-[#357fb2]">11.</span> Contacto
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1c2d51] shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Suporte SaaS</p>
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
              ImoSuite SaaS • Desenvolvido pela Moderno e Peculiar Unip. Lda
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUseSaaS;
