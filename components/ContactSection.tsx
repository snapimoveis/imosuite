
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, CheckCircle2, ShieldCheck, Mail, Phone, MessageSquare } from 'lucide-react';
import { LeadService } from '../services/leadService';

interface ContactSectionProps {
  tenantId: string;
  title?: string;
  subtitle?: string;
  isWhiteLabel?: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ 
  tenantId, 
  title = "Esclareça as suas dúvidas", 
  subtitle = "Estamos disponíveis para o ajudar a encontrar o investimento ideal ou vender o seu imóvel pelo melhor valor.",
  isWhiteLabel = false
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });

  const [consents, setConsents] = useState({
    legal: false,
    marketing: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent discard for bots
    
    if (!consents.legal) {
      setError("É obrigatório aceitar os termos de privacidade.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await LeadService.createLead(tenantId, {
        ...formData,
        tipo: 'contacto',
        gdpr_consent: consents.legal,
        gdpr_consent_text: "Declaro que li e aceito os Termos de Uso, a Política de Privacidade e o Acordo de Tratamento de Dados (DPA)...",
        property_id: 'general_contact',
        property_ref: 'SITE'
      });
      
      setSent(true);
    } catch (err) {
      console.error("Contact Form Error:", err);
      setError("Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <section className="py-24 px-6 max-w-4xl mx-auto text-center animate-in zoom-in-95 duration-500 bg-white rounded-[3rem] my-10 shadow-sm border border-slate-100">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-black text-[#1c2d51] mb-4 tracking-tighter">Mensagem Recebida!</h2>
        <p className="text-slate-500 font-medium mb-8">Agradecemos o seu contacto. A nossa equipa irá responder com a maior brevidade possível.</p>
        <button onClick={() => setSent(false)} className="text-[#357fb2] font-black uppercase text-[10px] tracking-widest border-b-2 border-[#357fb2] pb-1">Enviar nova mensagem</button>
      </section>
    );
  }

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto font-brand text-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1c2d51] tracking-tighter leading-tight mb-6">{title}</h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md">{subtitle}</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
               <div className="h-px w-8 bg-slate-100"></div> Compromisso de Qualidade
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <ShieldCheck size={20} className="text-[#357fb2] mb-3" />
                  <p className="text-xs font-black text-[#1c2d51] uppercase mb-1">Dados Seguros</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase leading-relaxed">Privacidade protegida sob as normas do RGPD.</p>
               </div>
               <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <MessageSquare size={20} className="text-[#357fb2] mb-3" />
                  <p className="text-xs font-black text-[#1c2d51] uppercase mb-1">Apoio Dedicado</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase leading-relaxed">Resposta personalizada para cada pedido.</p>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field */}
            <input type="text" className="hidden" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Nome Completo</label>
                <input required className="contact-input-v2" placeholder="O seu nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Email</label>
                <input required type="email" className="contact-input-v2" placeholder="email@exemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Telemóvel (Opcional)</label>
              <input type="tel" className="contact-input-v2" placeholder="+351 900 000 000" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">A sua Mensagem</label>
              <textarea required rows={4} className="contact-input-v2 resize-none" placeholder="Em que podemos ajudar?" value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})}></textarea>
            </div>

            {/* GDPR Legal Section */}
            <div className="space-y-4 py-6 border-y border-slate-50">
               <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    required 
                    checked={consents.legal} 
                    onChange={e => setConsents({...consents, legal: e.target.checked})} 
                    className="mt-1 w-4 h-4 rounded border-slate-200 text-[#1c2d51] focus:ring-[#1c2d51]" 
                  />
                  <span className="text-[10px] font-medium text-slate-500 leading-normal group-hover:text-slate-700 transition-colors">
                    Declaro que li e aceito os <Link to="/termos" className="text-[#357fb2] underline">Termos de Uso</Link> e a <Link to="/privacidade" className="text-[#357fb2] underline">Política de Privacidade</Link> da plataforma Imosuite, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD).
                  </span>
               </label>
               <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={consents.marketing} 
                    onChange={e => setConsents({...consents, marketing: e.target.checked})} 
                    className="mt-1 w-4 h-4 rounded border-slate-200 text-[#1c2d51] focus:ring-[#1c2d51]" 
                  />
                  <span className="text-[10px] font-medium text-slate-400 leading-normal italic group-hover:text-slate-600 transition-colors">
                    (Opcional) Autorizo o contacto para comunicações relacionadas com o serviço, podendo retirar o consentimento a qualquer momento.
                  </span>
               </label>
            </div>

            {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={isSending} 
              className="w-full bg-[#1c2d51] text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18}/>} Enviar Mensagem
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .contact-input-v2 { width: 100%; padding: 1.15rem 1.4rem; background: #f8fafc; border: 2px solid transparent; border-radius: 1.25rem; outline: none; font-weight: 700; color: #1c2d51; transition: all 0.2s; font-size: 0.875rem; }
        .contact-input-v2:focus { background: #fff; border-color: #357fb2; }
      `}</style>
    </section>
  );
};

export default ContactSection;
