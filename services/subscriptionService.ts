
import { collection, addDoc, onSnapshot, query, limit } from "@firebase/firestore";
import { db } from "../lib/firebase";
import { Tenant } from "../types";

export const StripePlans = {
  starter: "price_1StarterID_ReplaceMe", // Substitua pelo ID real do Stripe (29€)
  business: "price_1BusinessID_ReplaceMe" // Substitua pelo ID real do Stripe (49€)
};

export const SubscriptionService = {
  /**
   * Verifica se o tenant está num estado válido (Trial ou Ativo)
   */
  checkAccess: (tenant: Tenant, userEmail?: string | null): { hasAccess: boolean; isTrial: boolean; daysLeft: number } => {
    // 1. BYPASS PARA ADMINISTRADOR MASTER
    if (userEmail === 'snapimoveis@gmail.com') {
      return { hasAccess: true, isTrial: true, daysLeft: 999 };
    }

    const now = new Date();
    
    // 2. PARSING DA DATA DE CRIAÇÃO DO TENANT
    let createdAt: Date;
    if (tenant.created_at?.toDate) {
      createdAt = tenant.created_at.toDate();
    } else if (typeof tenant.created_at === 'string' || typeof tenant.created_at === 'number') {
      createdAt = new Date(tenant.created_at);
    } else {
      // Se não há data (ex: ainda a gravar no Firebase), assumimos que foi criado AGORA
      createdAt = new Date();
    }

    // 3. SEGURANÇA PARA CONTAS CRIADAS RECENTEMENTE (Grace Period de 1 hora)
    // Se a conta foi criada há menos de 60 minutos, damos acesso incondicional
    const diffCreationMs = now.getTime() - createdAt.getTime();
    if (diffCreationMs < 1000 * 60 * 60) {
      return { hasAccess: true, isTrial: true, daysLeft: 14 };
    }

    // 4. VERIFICAÇÃO DE ASSINATURA EXISTENTE
    if (!tenant.subscription) {
      return { hasAccess: false, isTrial: false, daysLeft: 0 };
    }
    
    // 5. TRATAMENTO ROBUSTO DA DATA DE FIM DE TRIAL
    let trialEnd: Date | null = null;
    const rawEnd = tenant.subscription.trial_ends_at;
    
    if (rawEnd?.toDate) {
      trialEnd = rawEnd.toDate();
    } else if (rawEnd instanceof Date) {
      trialEnd = rawEnd;
    } else if (typeof rawEnd === 'string' || typeof rawEnd === 'number') {
      trialEnd = new Date(rawEnd);
    }

    const isTrial = tenant.subscription.status === 'trialing';
    const isActive = ['active', 'past_due'].includes(tenant.subscription.status);
    
    // Se for Trial mas a data for inválida/ausente, damos 14 dias a partir da criação como fallback
    if (isTrial && (!trialEnd || isNaN(trialEnd.getTime()))) {
      trialEnd = new Date(createdAt);
      trialEnd.setDate(trialEnd.getDate() + 14);
    }

    // Cálculo de dias restantes (mínimo 0 se já passou)
    let daysLeft = 0;
    if (trialEnd) {
      const diffTime = trialEnd.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // Tem acesso se for trial ativo (mesmo com 0 dias, se for o último dia) OU conta paga
    const hasAccess = (isTrial && (daysLeft >= 0 || diffCreationMs < 1000 * 60 * 60)) || isActive;

    return { 
      hasAccess, 
      isTrial, 
      daysLeft 
    };
  },

  /**
   * Cria uma sessão de checkout do Stripe via extensão Firebase
   */
  createCheckoutSession: async (userId: string, priceId: string) => {
    const checkoutSessionsRef = collection(db, "users", userId, "checkout_sessions");
    
    const docRef = await addDoc(checkoutSessionsRef, {
      price: priceId,
      success_url: window.location.origin + "/#/admin?session=success",
      cancel_url: window.location.origin + "/#/admin/billing?session=cancel",
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 0,
        metadata: {
            source: 'imosuite_app'
        }
      }
    });

    onSnapshot(docRef, (snap) => {
      const { error, url } = snap.data() as any;
      if (error) {
        alert(`Erro Stripe: ${error.message}`);
      }
      if (url) {
        window.location.assign(url);
      }
    });
  }
};
