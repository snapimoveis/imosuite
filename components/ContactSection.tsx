import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, CheckCircle2, ShieldCheck, MessageSquare } from 'lucide-react';
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
  title = "Esclareça as suas dúvidas", 
  subtitle = "Estamos disponíveis para o ajudar a encontrar o investimento ideal ou vender o seu imóvel pelo melhor valor.",
  isWhiteLabel = false
}) => {
  const { tenant } = useTenant();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [consents, setConsents] = useState({ legal: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; 
    if (!consents.legal) { setError("Aceite os termos para continuar."); return; }
    setIsSending(true);
    setError(null);
    try {
      await LeadService.createLead(tenantId, { ...formData, tipo: 'contacto', gdpr_consent: consents.legal, property_id: 'site_general' });
      setSent(true);
    } catch (err) { setError("Erro ao enviar mensagem."); } finally { setIsSending(false); }
  };

  const getSecondaryWithOverlay = (hex: string) => {
    const defaultColor = 'rgba(28, 45, 81, 0.5)';
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return defaultColor;
    let r = 0, g = 0, b = 0;
    const cleanHex = hex.substring(1);
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    return isNaN(r) ? defaultColor : `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  const formBg = getSecondaryWithOverlay(tenant?.cor_secundaria || '#1c2d51');

  if (sent) {
    return (
      <section className="py-24 px-6 max-w-4xl mx-auto text-center animate-in zoom-in-95 duration-500 bg-white rounded-[3rem] my-10 shadow-sm border border-slate-100">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-black mb-4 tracking-tighter text-[#1c2d51] uppercase">Enviado com Sucesso</h2>
        <p className="text-slate-500 font-medium mb-8">Responderemos ao seu pedido o mais breve possível.</p>
        <button onClick={() => setSent(false)} className="text-[var(--primary)] font-black uppercase text-[10px] tracking-widest border-b-2 border-current pb-1">Enviar Nova Mensagem</button>
      </section>
    );
  }

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto font-brand">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-10">
          <div>
            <h2 className={`text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-8 ${isWhiteLabel ? 'text-[#1c2d51]' : 'text-white'}`}>{title}</h2>
            <p className={`text-lg md:text-xl font-medium leading-relaxed max-w-md ${isWhiteLabel ? 'text-slate-400' : 'text-white/70'}`}>{subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className={`p-8 rounded-[2rem] border shadow-sm ${isWhiteLabel ? 'bg-white border-slate-100' : 'bg-white/5 border-white/10'}`}>
                <ShieldCheck size={24} className="text-blue-500 mb-4" />
                <p className={`text-xs font-black uppercase mb-1 ${isWhiteLabel ? 'text-[#1c2d51]' : 'text-white'}`}>Dados Seguros</p>
                <p className={`text-[10px] font-bold uppercase ${isWhiteLabel ? 'text-slate-400' : 'text-white/50'}`}>Tratamento conforme o RGPD.</p>
             </div>
             <div className={`p-8 rounded-[2rem] border shadow-sm ${isWhiteLabel ? 'bg-white border-slate-100' : 'bg-white/5 border-white/10'}`}>
                <MessageSquare size={24} className="text-blue-500 mb-4" />
                <p className={`text-xs font-black uppercase mb-1 ${isWhiteLabel ? 'text-[#1c2d51]' : 'text-white'}`}>Resposta Rápida</p>
                <p className={`text-[10px] font-bold uppercase ${isWhiteLabel ? 'text-slate-400' : 'text-white/50'}`}>Acompanhamento em 24h.</p>
             </div>
          </div>
        </div>

        <div className="p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative z-10 backdrop-blur-xl border border-white/20" style={{ backgroundColor: formBg }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" className="hidden" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required className="contact-input-v4" placeholder="O seu nome" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              <input required type="email" className="contact-input-v4" placeholder="O seu email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <input className="contact-input-v4" placeholder="Telemóvel" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
            <textarea required rows={4} className="contact-input-v4 resize-none" placeholder="A sua mensagem..." value={formData.mensagem} onChange={e => setFormData({...formData, mensagem: e.target.value})}></textarea>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required checked={consents.legal} onChange={e => setConsents({...consents, legal: e.target.checked})} className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-white" />
              <span className="text-[10px] font-bold text-white/70">Aceito a <Link to="/privacidade" className="text-white underline">Política de Privacidade</Link>.</span>
            </label>
            <button type="submit" disabled={isSending} className="w-full bg-white text-[#1c2d51] py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:-translate-y-1 transition-all">
              {isSending ? <Loader2 className="animate-spin" /> : <Send size={18}/>} Enviar Pedido
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .contact-input-v4 { width: 100%; padding: 1.25rem 1.5rem; background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; outline: none; font-weight: 700; color: white; transition: all 0.3s; font-size: 0.875rem; }
        .contact-input-v4:focus { background: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.3); }
        .contact-input-v4::placeholder { color: rgba(255, 255, 255, 0.5); }
      `}</style>
    </section>
  );
};

export default ContactSection;