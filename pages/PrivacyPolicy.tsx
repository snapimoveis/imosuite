import React from 'react';
import { Shield, Lock, Eye, ArrowLeft, Mail, Phone, Users, Database, Globe, Scale, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20 font-brand selection:bg-[#1c2d51] selection:text-white">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-[#1c2d51] transition-all mb-12">
          <ArrowLeft size={16} /> Voltar ao Início
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-[#357fb2] rounded-2xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter">Política de Privacidade</h1>
        </div>

        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12 border-b border-slate-100 pb-8">
          Última Atualização: {new Date().toLocaleDateString('pt-PT')} • ImoSuite – Plataforma SaaS White-Label
        </p>

        <div className="prose prose-slate max-w-none space-y-12">
          
          {/* Summary Box */}
          <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 flex gap-6 items-start">
             <AlertCircle className="text-[#357fb2] shrink-0" size={24}/>
             <p className="text-sm font-bold text-blue-900 leading-relaxed m-0">
               Nota Importante: A Imosuite atua, nos termos do RGPD, maioritariamente como <strong>Subcontratante (Data Processor)</strong>, processando dados pessoais por conta dos seus clientes imobiliários.
             </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">01.</span> Identificação do Prestador
            </h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-slate-600 leading-relaxed font-medium">
              <p>A plataforma Imosuite é um software SaaS desenvolvido e operado por:</p>
              <ul className="mt-4 space-y-1 list-none p-0 text-slate-900">
                <li><strong>Empresa:</strong> Moderno e Peculiar Unip. Lda</li>
                <li><strong>NIF:</strong> 515017170</li>
                <li><strong>Email:</strong> <a href="mailto:dados@imosuite.pt" className="text-[#357fb2] no-underline">dados@imosuite.pt</a></li>
                <li><strong>Telefone:</strong> +351 918 152 116</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">02.</span> Modelo White-Label e Responsabilidades
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              A Imosuite disponibiliza a sua plataforma em modelo white-label, permitindo que as agências imobiliárias (clientes) utilizem o software sob a sua própria marca.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <h4 className="text-xs font-black uppercase text-[#1c2d51] mb-2">O Cliente (Imobiliária)</h4>
                  <p className="text-xs text-slate-500 m-0">Atua como <strong>Responsável pelo Tratamento (Data Controller)</strong>. Define as finalidades e garante a base legal para a recolha de dados dos seus próprios clientes.</p>
               </div>
               <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <h4 className="text-xs font-black uppercase text-[#357fb2] mb-2">A Imosuite (SaaS)</h4>
                  <p className="text-xs text-slate-500 m-0">Atua como <strong>Subcontratante (Data Processor)</strong>. Trata os dados apenas de acordo com as instruções do cliente e para o funcionamento técnico da plataforma.</p>
               </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">03.</span> Dados Pessoais Tratados
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">A Imosuite trata, em nome dos seus clientes, as seguintes categorias de dados:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {[
                "Dados de identificação dos utilizadores (nome, email, telefone)",
                "Dados de clientes finais (leads) inseridos pelas agências",
                "Dados de imóveis, contratos e interações comerciais",
                "Dados técnicos de acesso (IP, logs, data/hora)",
                "Dados de faturação e subscrição da plataforma"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#357fb2]"></div>
                  <span className="text-xs font-bold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">04.</span> Finalidades do Tratamento
            </h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] text-slate-600 leading-relaxed font-medium">
              <p className="m-0">Os dados são tratados exclusivamente para:</p>
              <ul className="mt-4 space-y-3">
                <li>Disponibilização e funcionamento técnico da plataforma SaaS</li>
                <li>Gestão de contas de agência e utilizadores associados</li>
                <li>Prestação de suporte técnico e manutenção de segurança</li>
                <li>Cumprimento de obrigações legais e fiscais do prestador</li>
              </ul>
              <p className="mt-6 text-sm italic font-bold border-t border-slate-200 pt-4">A Imosuite não utiliza os dados inseridos pelos seus clientes para fins próprios de marketing dirigido aos clientes finais das agências.</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">05.</span> Conservação e Subcontratantes
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              Os dados são conservados durante a vigência do contrato SaaS ou pelo período necessário para obrigações legais. A Imosuite recorre a subcontratantes tecnológicos de renome (como serviços cloud e email transacional) que garantem estrito cumprimento do RGPD.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">06.</span> Direitos e Segurança
            </h2>
            <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2rem] space-y-6">
              <p className="text-slate-600 leading-relaxed font-medium m-0">
                Os titulares podem exercer os seus direitos de acesso, retificação ou apagamento diretamente junto da imobiliária (Responsável). A Imosuite prestará todo o apoio técnico necessário para a execução desses pedidos.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="flex items-center gap-3 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 p-3 rounded-xl">
                    <Lock size={16}/> Encriptação AES-256
                 </div>
                 <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 p-3 rounded-xl">
                    <Database size={16}/> Isolamento entre Tenants
                 </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-12 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1c2d51] shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Privacidade e Dados</p>
                  <p className="font-bold text-[#1c2d51]">dados@imosuite.pt</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1c2d51] shadow-sm">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Suporte Técnico</p>
                  <p className="font-bold text-[#1c2d51]">+351 918 152 116</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pt-12 text-center">
            <Shield className="mx-auto text-slate-200 mb-6" size={48}/>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed max-w-lg mx-auto m-0">
              ImoSuite SaaS • Desenvolvido pela Moderno e Peculiar Unip. Lda
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
