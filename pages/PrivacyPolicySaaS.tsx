import React from 'react';
import { 
  Shield, Lock, Eye, ArrowLeft, Mail, Phone, Users, 
  Database, Globe, Scale, AlertCircle, Cookie, RefreshCw,
  Building2, CheckCircle2, Target, Share2, Clock, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicySaaS: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20 font-brand selection:bg-[#1c2d51] selection:text-white">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/privacidade" className="inline-flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-[#1c2d51] transition-all mb-12">
          <ArrowLeft size={16} /> Voltar à Política Geral
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-[#357fb2] rounded-2xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter uppercase leading-tight">
            POLÍTICA DE PRIVACIDADE <br/>
            <span className="text-[#357fb2]">Imosuite – Plataforma SaaS White-Label</span>
          </h1>
        </div>

        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12 border-b border-slate-100 pb-8">
          Última Atualização: {new Date().toLocaleDateString('pt-PT')} • Imosuite
        </p>

        <div className="prose prose-slate max-w-none space-y-12">
          
          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">01.</span> Identificação do Prestador da Plataforma
            </h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-slate-600 leading-relaxed font-medium">
              <p className="m-0">A plataforma Imosuite é um software SaaS white-label, desenvolvido e operado por:</p>
              <ul className="mt-6 space-y-2 list-none p-0 text-slate-900">
                <li className="flex items-center gap-3"><Building2 size={16} className="text-slate-400"/> <strong>Empresa:</strong> Moderno e Peculiar Unip. Lda</li>
                <li className="flex items-center gap-3"><Scale size={16} className="text-slate-400"/> <strong>NIF:</strong> 515017170</li>
                <li className="flex items-center gap-3"><Mail size={16} className="text-slate-400"/> <strong>Email de contacto:</strong> <a href="mailto:dados@imosuite.pt" className="text-[#357fb2] no-underline">dados@imosuite.pt</a></li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-slate-400"/> <strong>Telefone:</strong> +351 918 152 116</li>
              </ul>
              <p className="mt-6 text-sm font-bold text-[#1c2d51] border-t border-slate-200 pt-4">
                A Imosuite atua, nos termos do RGPD, maioritariamente como Subcontratante (Data Processor), processando dados pessoais por conta dos seus clientes.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">02.</span> Modelo White-Label e Responsabilidades
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">
              A Imosuite disponibiliza a sua plataforma em modelo white-label, permitindo que os seus clientes utilizem o software sob a sua própria marca.
            </p>
            <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 space-y-4">
              <p className="font-bold text-[#1c2d51] m-0">Nestes casos:</p>
              <ul className="space-y-3 list-none p-0 text-slate-600">
                <li className="flex gap-3"><CheckCircle2 size={16} className="text-[#357fb2] shrink-0 mt-1"/> O cliente é o Responsável pelo Tratamento (Data Controller) dos dados inseridos na plataforma.</li>
                <li className="flex gap-3"><CheckCircle2 size={16} className="text-[#357fb2] shrink-0 mt-1"/> A Imosuite atua como Subcontratante, tratando os dados apenas de acordo com as instruções do cliente.</li>
              </ul>
              <p className="text-xs font-bold text-slate-500 m-0 pt-2">
                Cada cliente é responsável por: Garantir base legal para recolha e tratamento de dados; Informar os titulares dos dados; Disponibilizar a sua própria Política de Privacidade, quando aplicável.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">03.</span> Dados Pessoais Tratados
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">A Imosuite pode tratar, em nome dos seus clientes, os seguintes dados:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {[
                "Dados de identificação (nome, email, telefone)",
                "Dados de clientes finais inseridos pelos utilizadores",
                "Dados de imóveis, contratos, leads e interações",
                "Dados de autenticação e acesso",
                "Dados técnicos (IP, logs, data/hora de acesso)",
                "Dados de faturação e subscrição"
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
              <span className="text-[#357fb2]">04.</span> Finalidades do Tratamento
            </h2>
            <div className="bg-[#1c2d51] p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
              <Target className="absolute -right-10 -bottom-10 text-white/5 w-64 h-64 rotate-12" />
              <p className="text-sm font-bold mb-6 opacity-80">Os dados são tratados exclusivamente para:</p>
              <ul className="space-y-4 list-none p-0 relative z-10">
                {[
                  "Disponibilização e funcionamento da plataforma SaaS",
                  "Gestão de contas e utilizadores",
                  "Prestação de serviços contratados",
                  "Suporte técnico e segurança",
                  "Cumprimento de obrigações legais"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm font-medium opacity-90">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#357fb2] mt-2 shrink-0"></div>
                    {text}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-xs font-black uppercase tracking-widest text-[#357fb2] relative z-10">A Imosuite não utiliza os dados para fins próprios de marketing dos clientes finais.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">05.</span> Fundamento Legal
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">O tratamento de dados assenta em:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
               <LegalCard title="Execução de Contrato" desc="Com os clientes da plataforma." />
               <LegalCard title="Obrigações Legais" desc="Cumprimento de normas vigentes." />
               <LegalCard title="Interesse Legítimo" desc="Segurança e prevenção de fraude." />
               <LegalCard title="Consentimento" desc="Quando aplicável (sob responsabilidade do cliente)." />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">06.</span> Conservação dos Dados
            </h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4 text-slate-600 font-medium text-sm">
              <p className="m-0 font-bold text-[#1c2d51]">Os dados são conservados:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Durante a vigência do contrato.</li>
                <li>Pelo período necessário para obrigações legais.</li>
                <li>Até pedido de eliminação pelo cliente, salvo obrigação legal em contrário.</li>
              </ul>
              <p className="mt-4 m-0 font-bold text-[#1c2d51]">Após cessação do contrato, os dados podem ser:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Exportados pelo cliente.</li>
                <li>Eliminados de forma segura.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">07.</span> Subcontratantes e Infraestrutura
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">
              A Imosuite pode recorrer a subcontratantes tecnológicos, nomeadamente: Serviços cloud; Serviços de email transacional; Serviços de pagamento; Ferramentas de monitorização e segurança. Todos cumprem o RGPD e garantem níveis adequados de proteção.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">08.</span> Transferências Internacionais
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
              <Globe className="text-[#357fb2] shrink-0" size={20} />
              Caso existam transferências de dados para fora da União Europeia, estas serão realizadas apenas com garantias adequadas, como Cláusulas Contratuais-Tipo da Comissão Europeia ou Decisões de adequação.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">09.</span> Direitos dos Titulares dos Dados
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">
              Os titulares dos dados podem exercer os seus direitos junto do Responsável pelo Tratamento (cliente). Sempre que necessário, a Imosuite prestará apoio técnico para: Acesso; Retificação; Apagamento; Portabilidade; Limitação ou oposição. Pedidos podem também ser encaminhados para <a href="mailto:dados@imosuite.pt" className="text-[#357fb2]">dados@imosuite.pt</a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">10.</span> Segurança da Informação
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
               {["Controlo de acessos", "Encriptação", "Isolamento de dados", "Logs e monitorização", "Backups regulares"].map((dir, i) => (
                 <div key={i} className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100 flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight leading-tight">{dir}</span>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">11.</span> Alterações
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium flex items-start gap-4">
              <RefreshCw size={20} className="text-slate-300 shrink-0 mt-1" />
              Esta Política pode ser atualizada a qualquer momento. Recomenda-se a consulta periódica.
            </p>
          </section>

          <section className="space-y-6 pt-12 border-t border-slate-100">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">12.</span> Contacto
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1c2d51] shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Suporte de Dados</p>
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
            <ShieldCheck className="mx-auto text-slate-200 mb-6" size={48}/>
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

export default PrivacyPolicySaaS;