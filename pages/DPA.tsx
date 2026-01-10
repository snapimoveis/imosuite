
import React from 'react';
import { 
  FileText, ArrowLeft, Mail, Phone, Scale, Building2, 
  CheckCircle2, Globe, ShieldCheck, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DPA: React.FC = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20 font-brand selection:bg-[#1c2d51] selection:text-white">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/privacidade" className="inline-flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-[#1c2d51] transition-all mb-12">
          <ArrowLeft size={16} /> Voltar à Política de Privacidade
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-[#357fb2] rounded-2xl flex items-center justify-center">
            <FileText size={24} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter uppercase leading-tight">
            CLÁUSULA DE DATA PROCESSING AGREEMENT (DPA) <br/>
            <span className="text-[#357fb2]">Imosuite – SaaS White-Label</span>
          </h1>
        </div>

        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12 border-b border-slate-100 pb-8">
          Imosuite – SaaS White-Label • Moderno e Peculiar Unip. Lda
        </p>

        <div className="prose prose-slate max-w-none space-y-12">
          
          <section className="space-y-6">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">01.</span> Partes
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">O presente Acordo de Tratamento de Dados (“DPA”) é celebrado entre:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <h3 className="text-xs font-black uppercase text-[#357fb2] mb-4">Responsável pelo Tratamento (Data Controller):</h3>
                <p className="text-sm font-bold text-[#1c2d51] m-0">Cliente da plataforma Imosuite (empresa que utiliza a solução em regime white-label)</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <h3 className="text-xs font-black uppercase text-[#357fb2] mb-4">Subcontratante (Data Processor):</h3>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[#1c2d51] m-0">Moderno e Peculiar Unip. Lda</p>
                  <p className="text-xs font-medium text-slate-500 m-0">NIF: 515017170</p>
                  <p className="text-xs font-medium text-slate-500 m-0">Email: dados@imosuite.pt</p>
                  <p className="text-xs font-medium text-slate-500 m-0">Telefone: +351 918 152 116</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">02.</span> Objeto
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">
              O presente DPA regula o tratamento de dados pessoais efetuado pela Imosuite, enquanto Subcontratante, por conta e segundo instruções do Responsável pelo Tratamento, nos termos do Regulamento (UE) 2016/679 (RGPD).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">03.</span> Natureza e Finalidade do Tratamento
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">O tratamento de dados pessoais destina-se exclusivamente a:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
              {[
                "Disponibilização e funcionamento da plataforma SaaS",
                "Gestão de utilizadores, imóveis, leads e clientes",
                "Armazenamento, consulta e processamento de dados",
                "Suporte técnico e manutenção",
                "Segurança e prevenção de fraude"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <CheckCircle2 size={16} className="text-[#357fb2]" />
                  <span className="text-xs font-bold text-slate-700">{text}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">04.</span> Tipos de Dados e Categorias de Titulares
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Tipos de dados:</p>
                <div className="flex flex-wrap gap-2">
                  {["Nome, email, telefone", "Dados profissionais e comerciais", "Dados de autenticação", "Dados de faturação", "Endereço IP e logs técnicos"].map((t, i) => (
                    <span key={i} className="px-4 py-2 bg-blue-50 text-[#357fb2] text-[10px] font-black uppercase rounded-lg border border-blue-100">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">Titulares dos dados:</p>
                <div className="flex flex-wrap gap-2">
                  {["Utilizadores da plataforma", "Clientes finais do Responsável pelo Tratamento", "Colaboradores e parceiros"].map((t, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-50 text-[#1c2d51] text-[10px] font-black uppercase rounded-lg border border-slate-100">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">05.</span> Obrigações do Subcontratante (Imosuite)
            </h2>
            <div className="bg-[#1c2d51] p-10 rounded-[3rem] text-white space-y-4">
              <p className="text-sm font-bold opacity-80 m-0">A Imosuite compromete-se a:</p>
              <ul className="space-y-3 list-none p-0">
                {[
                  "Tratar dados apenas mediante instruções documentadas do Cliente",
                  "Garantir confidencialidade dos dados",
                  "Implementar medidas técnicas e organizativas adequadas",
                  "Auxiliar o Cliente no exercício dos direitos dos titulares",
                  "Notificar o Cliente sem demora em caso de violação de dados",
                  "Eliminar ou devolver os dados no termo do contrato, salvo obrigação legal"
                ].map((t, i) => (
                  <li key={i} className="flex gap-4 items-start text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#357fb2] mt-2 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">06.</span> Obrigações do Responsável pelo Tratamento
            </h2>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
              <p className="text-sm font-bold text-slate-700 m-0">O Cliente compromete-se a:</p>
              <ul className="space-y-3 list-none p-0">
                {[
                  "Garantir base legal para o tratamento dos dados",
                  "Informar os titulares dos dados",
                  "Obter consentimentos quando aplicável",
                  "Utilizar a plataforma de forma conforme ao RGPD"
                ].map((t, i) => (
                  <li key={i} className="flex gap-3 items-center text-sm font-medium text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">07.</span> Subcontratação
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">O Cliente autoriza a Imosuite a recorrer a subcontratantes adicionais, desde que:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {["Cumpram o RGPD", "Sejam vinculados por obrigações equivalentes", "Sejam devidamente identificados em anexo"].map((t, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-500">{t}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">08.</span> Transferências Internacionais
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 flex items-start gap-4 m-0">
              <Globe className="text-[#357fb2] shrink-0" size={20} />
              Quaisquer transferências de dados para fora da UE apenas ocorrerão mediante garantias adequadas, incluindo Cláusulas Contratuais-Tipo ou decisões de adequação.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">09.</span> Duração
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">
              O presente DPA vigora durante toda a duração do contrato principal de prestação de serviços.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              <span className="text-[#357fb2]">10.</span> Lei Aplicável
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium m-0">
              Aplica-se a lei portuguesa, sendo competente o foro legalmente aplicável.
            </p>
          </section>

          <section className="space-y-6 pt-12 border-t border-slate-100">
            <h2 className="text-xl font-black text-[#1c2d51] uppercase tracking-tight flex items-center gap-3 m-0">
              📎 ANEXO I – SUBCONTRATANTES AUTORIZADOS
            </h2>
            <p className="text-sm text-slate-500 font-medium m-0">A Imosuite pode recorrer aos seguintes subcontratantes tecnológicos:</p>
            
            <div className="overflow-hidden border border-slate-100 rounded-3xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Serviço</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Finalidade</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Localização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="px-6 py-4 text-xs font-bold text-[#1c2d51]">Cloud Hosting (ex.: AWS / GCP / Azure)</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">Infraestrutura e armazenamento</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">UE / fora da UE*</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-xs font-bold text-[#1c2d51]">Serviços de Email Transacional</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">Envio de comunicações técnicas</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">UE / fora da UE*</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-xs font-bold text-[#1c2d51]">Processadores de Pagamento</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">Faturação e subscrição</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">UE</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-xs font-bold text-[#1c2d51]">Ferramentas de Monitorização</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">Segurança e desempenho</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">UE / fora da UE*</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-xs font-bold text-[#1c2d51]">Serviços de Backup</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">Continuidade de negócio</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">UE</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
               <p className="text-[10px] text-slate-400 font-bold m-0 italic">
                 * Quando aplicável, com Cláusulas Contratuais-Tipo. A lista pode ser atualizada conforme evolução tecnológica, sendo o Cliente informado quando legalmente exigido.
               </p>
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

export default DPA;
