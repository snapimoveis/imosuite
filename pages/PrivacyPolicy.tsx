
import React from 'react';
import { 
  Shield, Lock, Eye, ArrowLeft, Mail, Phone, Users, 
  Database, Globe, Scale, AlertCircle, Cookie, RefreshCw,
  Building2, CheckCircle2, Target, Share2, Clock, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20 font-brand selection:bg-[#1c2d51] selection:text-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col gap-4 mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-[#1c2d51] transition-all">
            <ArrowLeft size={16} /> Voltar ao Início
          </Link>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/privacidade-saas" className="inline-flex items-center gap-2 bg-slate-50 text-[#1c2d51] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1c2d51] hover:text-white transition-all shadow-sm border border-slate-100">
              <Globe size={14} /> POLÍTICA DE PRIVACIDADE SaaS
            </Link>
            <Link to="/dpa" className="inline-flex items-center gap-2 bg-slate-50 text-[#1c2d51] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1c2d51] hover:text-white transition-all shadow-sm border border-slate-100">
              <FileText size={14} /> Acordo de Tratamento de Dados (“DPA”)
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-[#357fb2] rounded-2xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter uppercase">Política de Privacidade</h1>
        </div>

        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12 border-b border-slate-100 pb-8">
          Última Atualização: {new Date().toLocaleDateString('pt-PT')} • Imosuite
        </p>

        <div className="prose prose-slate max-w-none space-y-12">
          
          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">01.</span> Identificação do Responsável
            </h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-slate-600 leading-relaxed font-medium">
              <p className="m-0">O presente documento regula o tratamento de dados pessoais realizado através da plataforma Imosuite, detida por:</p>
              <ul className="mt-6 space-y-2 list-none p-0 text-slate-900">
                <li className="flex items-center gap-3"><Building2 size={16} className="text-slate-400"/> <strong>Empresa:</strong> Moderno e Peculiar Unip. Lda</li>
                <li className="flex items-center gap-3"><Scale size={16} className="text-slate-400"/> <strong>NIF:</strong> 515017170</li>
                <li className="flex items-center gap-3"><Mail size={16} className="text-slate-400"/> <strong>Email:</strong> <a href="mailto:dados@imosuite.pt" className="text-[#357fb2] no-underline">dados@imosuite.pt</a></li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-slate-400"/> <strong>Telefone:</strong> +351 918 152 116</li>
              </ul>
              <p className="mt-6 text-sm font-bold text-[#1c2d51] border-t border-slate-200 pt-4">
                A Moderno e Peculiar Unip. Lda é a Responsável pelo Tratamento dos dados pessoais, nos termos do Regulamento Geral sobre a Proteção de Dados (RGPD).
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">02.</span> Dados Pessoais Recolhidos
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">A Imosuite pode recolher e tratar os seguintes dados pessoais:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {[
                "Nome completo",
                "Endereço de email",
                "Número de telefone",
                "Dados de identificação fiscal",
                "Dados de autenticação e acesso",
                "Dados de faturação",
                "Endereço IP e dados de navegação",
                "Dados de imóveis e leads inseridos"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">03.</span> Finalidades do Tratamento
            </h2>
            <div className="bg-[#1c2d51] p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
              <Target className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-12" />
              <ul className="space-y-4 list-none p-0 relative z-10">
                {[
                  "Criação e gestão de conta na plataforma",
                  "Prestação dos serviços contratados",
                  "Gestão comercial, administrativa e financeira",
                  "Comunicação direta com o utilizador",
                  "Cumprimento de obrigações legais e fiscais",
                  "Melhoria da experiência e segurança"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-medium opacity-90">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#357fb2] mt-2 shrink-0"></div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">04.</span> Fundamento Legal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <LegalCard title="Execução de Contrato" desc="Para viabilizar o serviço subscrito." />
               <LegalCard title="Consentimento" desc="Quando expressamente autorizado pelo titular." />
               <LegalCard title="Obrigações Legais" desc="Cumprimento de normas fiscais e jurídicas." />
               <LegalCard title="Interesse Legítimo" desc="Segurança e melhoria contínua do software." />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">05.</span> Conservação dos Dados
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
              <Clock className="text-[#357fb2] shrink-0" size={20} />
              Os dados pessoais serão conservados apenas pelo período necessário para cumprir as finalidades descritas ou enquanto existir obrigação legal para a sua manutenção.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">06.</span> Partilha com Terceiros
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">Os dados poderão ser partilhados com:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
               <div className="p-6 bg-white border border-slate-100 rounded-3xl text-center space-y-3">
                  <Database className="mx-auto text-blue-500" size={24} />
                  <p className="text-[10px] font-black uppercase text-[#1c2d51]">Serviços Tech</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Cloud, Email, Pagamentos</p>
               </div>
               <div className="p-6 bg-white border border-slate-100 rounded-3xl text-center space-y-3">
                  <Scale className="mx-auto text-blue-500" size={24} />
                  <p className="text-[10px] font-black uppercase text-[#1c2d51]">Autoridades</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Legais ou Fiscais</p>
               </div>
               <div className="p-6 bg-white border border-slate-100 rounded-3xl text-center space-y-3">
                  <Shield size={24} className="mx-auto text-emerald-500" />
                  <p className="text-[10px] font-black uppercase text-[#1c2d51]">Conformidade</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Estrito Cumprimento RGPD</p>
               </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">07.</span> Direitos do Titular
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">Nos termos do RGPD, o titular dos dados tem direito a:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
               {["Acesso", "Retificação", "Apagamento", "Limitação", "Portabilidade", "Oposição", "Retirada de Consentimento"].map((dir, i) => (
                 <div key={i} className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">{dir}</span>
                 </div>
               ))}
            </div>
            <p className="text-xs font-bold text-slate-400 mt-4 italic">Os pedidos devem ser enviados para: <a href="mailto:dados@imosuite.pt" className="text-[#357fb2]">dados@imosuite.pt</a></p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">08.</span> Segurança dos Dados
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 flex items-start gap-4">
              <Lock className="text-[#357fb2] shrink-0" size={20} />
              A Imosuite aplica medidas técnicas e organizativas adequadas para proteger os dados pessoais contra perda, acesso não autorizado, alteração ou divulgação indevida.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">09.</span> Cookies
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 flex items-start gap-4">
              <Cookie className="text-amber-600 shrink-0" size={20} />
              A plataforma pode utilizar cookies estritamente necessários ao funcionamento e cookies analíticos. O utilizador pode gerir as suas preferências através das configurações do navegador.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">10.</span> Alterações
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium flex items-start gap-4">
              <RefreshCw size={20} className="text-slate-300 shrink-0 mt-1" />
              A presente Política de Privacidade pode ser atualizada a qualquer momento. Recomenda-se a consulta periódica deste documento no website oficial.
            </p>
          </section>

          <section className="space-y-6 pt-12 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1c2d51] shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Questões e Dados</p>
                  <p className="font-bold text-[#1c2d51]">dados@imosuite.pt</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1c2d51] shadow-sm">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Linha Directa</p>
                  <p className="font-bold text-[#1c2d51]">+351 918 152 116</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-12 text-center">
            <Shield className="mx-auto text-slate-200 mb-6" size={48}/>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed max-w-lg mx-auto m-0">
              Imosuite • Software desenvolvido pela Moderno e Peculiar Unip. Lda
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

const LegalCard = ({ title, desc }: { title: string, desc: string }) => (
  <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
    <h4 className="text-xs font-black uppercase text-[#1c2d51] mb-2">{title}</h4>
    <p className="text-xs text-slate-500 m-0 leading-relaxed">{desc}</p>
  </div>
);

export default PrivacyPolicy;
