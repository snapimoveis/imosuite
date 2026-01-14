import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, CheckCircle2, ShieldCheck, Mail, Phone, MessageSquare } from 'lucide-react';
import { LeadService } from '../services/leadService';
import { useTenant } from '../contexts/TenantContext';

interface ContactSectionProps {
  tenantId: string;
  title?: string;
  subtitle?: string;
  isWhiteLabel?: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ 
  tenantId, 
  title = "Fale com os nossos especialistas", 
  subtitle = "Estamos prontos para ajudar a escalar a sua operação imobiliária com a melhor tecnologia do mercado.",
  isWhiteLabel = false
}) => {
  const { tenant } = useTenant();
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
    legal: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; 
    
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
        gdpr_consent_text: "Declaro que li e aceito os Termos de Uso e a Política de Privacidade.",
        property_id: 'general_contact',
        property_ref: 'SITE'
      });
      
      setSent(true);
    } catch (err) {
      console.error("Contact Form Error:", err);
      setError("Ocorreu um erro ao enviar a mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  // Helper robusto para converter HEX em RGBA (0.5)
  const getSecondaryWithOverlay = (hex: string) => {
    const defaultColor = 'rgba(28, 45, 81, 0.5)';
    if (!hex || typeof hex !== 'string') return defaultColor;
    
    let c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const r = parseInt(c[0] + c[1], 16);
    const g = parseInt(c[2] + c[3], 16);
    const b = parseInt(c[4] + c[5], 16);
    
    if (isNaN(r) || isNaN(g) || isNaN(b)) return defaultColor;
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  const formBg = getSecondaryWithOverlay(tenant?.cor_secundaria || '#1c2d51');

  if (sent) {
    return (
      <section className="py-24 px-6 max-w-4xl mx-auto text-center animate-in zoom-in-95 duration-500 bg-white rounded-[3.5rem] my-10 shadow-sm border border-slate-100">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tighter text-[#1c2d51] uppercase">Mensagem Enviada!</h2>
        <p className="text-slate-500 font-medium mb-8">Obrigado pelo seu interesse. Entraremos em contacto brevemente.</p>
        <button onClick={() => setSent(false)} className="text-[#357fb2] font-black uppercase text-[10px] tracking-widest border-b-2 border-[#357fb2] pb-1 hover:opacity-70 transition-all">Enviar outra mensagem</button>
      </section>
    );
  }

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto font-brand">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <div>
            <h2 className={`text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-8 ${isWhiteLabel ? 'text-[#1c2d51]' : 'text-white'}`}>
              {title}
            </h2>
            <p className={`text-lg md:text-xl font-medium leading-relaxed max-w-md ${isWhiteLabel ? 'text-slate-400' : 'text-white/70'}`}>
              {subtitle}
            </p>
          </div>
          
          <div className="space-y-6">
            <div className={`flex items-center gap-4 font-black uppercase text-[9px] tracking-[0.3em] ${isWhiteLabel ? 'text-slate-300' : 'text-white/30'}`}>
               <div className={`h-px w-8 ${isWhiteLabel ? 'bg-slate-200' : 'bg-white/10'}`}></div> Compromisso de Qualidade
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className={`p-8 rounded-[2rem] border shadow-sm transition-all hover:scale-[1.02] ${isWhiteLabel ? 'bg-white border-slate-100' : 'bg-white/5 backdrop-blur-md border-white/10'}`}>
                  <ShieldCheck size={24} className={isWhiteLabel ? 'text-blue-500 mb-4' : 'text-white mb-4'} />
                  <p className={`text-xs font-black uppercase mb-1 ${isWhiteLabel ? 'text-[#1c2d51]' : 'text-white'}`}>Dados Seguros</p>
                  <p className={`text-[10px] font-bold uppercase leading-relaxed ${isWhiteLabel ? 'text-slate-400' : 'text-white/50'}`}>Tratamento em conformidade absoluta com o RGPD.</p>
               </div>
               <div className={`p-8 rounded-[2rem] border shadow-sm transition-all hover:scale-[1.02] ${isWhiteLabel ? 'bg-white border-slate-100' : 'bg-white/5 backdrop-blur-md border-white/10'}`}>
                  <MessageSquare size={24} className={isWhiteLabel ? 'text-blue-500 mb-4' : 'text-white mb-4'} />
                  <p className={`text-xs font-black uppercase mb-1 ${isWhiteLabel ? 'text-[#1c2d51]' : 'text-white'}`}>Apoio Dedicado</p>
                  <p className={`text-[10px] font-bold uppercase leading-relaxed ${isWhiteLabel ? 'text-slate-400' : 'text-white/50'}`}>Resposta personalizada pelos nossos melhores agentes.</p>
               </div>
            </div>
          </div>
        </div>

        <div 
          className="p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative z-10 backdrop-blur-xl border border-white/20 overflow-hidden group"
          style={{ backgroundColor: formBg }}
        >
          {/* Subtle decorative glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <input type="text" className="hidden" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white tracking-[0.2em] ml-2 opacity-80">Nome Completo</label>
                <input required className="contact-input-v3" placeholder="O seu nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-white tracking-[0.2em] ml-2 opacity-80">Email</label>
                <input required type="email" className="contact-input-v3" placeholder="email@exemplo.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-white tracking-[0.2em] ml-2 opacity-80">Telemóvel (Opcional)</label>
              <input type="tel" className="contact-input-v3" placeholder="+351 900 000 000" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-white tracking-[0.2em] ml-2 opacity-80">A sua Mensagem</label>
              <textarea required rows={4} className="contact-input-v3 resize-none" placeholder="Em que podemos ajudar?" value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})}></textarea>
            </div>

            <div className="py-6 border-y border-white/10">
               <label className="flex items-start gap-4 cursor-pointer group/label">
                  <input 
                    type="checkbox" 
                    required 
                    checked={consents.legal} 
                    onChange={e => setConsents({...consents, legal: e.target.checked})} 
                    className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 text-[#1c2d51] focus:ring-offset-0 focus:ring-white/20 transition-all" 
                  />
                  <span className="text-[10px] font-bold text-white/70 leading-normal group-hover/label:text-white transition-colors">
                    Declaro que li e aceito os <Link to="/termos" className="text-white underline decoration-white/30 hover:decoration-white">Termos de Uso</Link> e a <Link to="/privacidade" className="text-white underline decoration-white/30 hover:decoration-white">Política de Privacidade</Link>.
                  </span>
               </label>
            </div>

            {error && <p className="text-red-200 text-[10px] font-black uppercase text-center bg-red-500/20 py-2 rounded-lg">{error}</p>}

            <button 
              type="submit" 
              disabled={isSending} 
              className="w-full bg-white text-[#1c2d51] py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-white/10 transition-all disabled:opacity-50"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18}/>} Enviar Mensagem
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .contact-input-v3 { 
          width: 100%; 
          padding: 1.25rem 1.5rem; 
          background: rgba(255, 255, 255, 0.1); 
          border: 2px solid rgba(255, 255, 255, 0.1); 
          border-radius: 1.5rem; 
          outline: none; 
          font-weight: 700; 
          color: white; 
          transition: all 0.3s; 
          font-size: 0.875rem; 
        }
        .contact-input-v3:focus { 
          background: rgba(255, 255, 255, 0.2); 
          border-color: rgba(255, 255, 255, 0.3); 
          box-shadow: 0 0 20px rgba(255,255,255,0.05);
        }
        .contact-input-v3::placeholder { 
          color: rgba(255, 255, 255, 0.4); 
          font-weight: 500;
        }
      `}</style>
    </section>
  );
};

export default ContactSection;