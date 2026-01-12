
import { collection, addDoc, onSnapshot, query, limit } from "@firebase/firestore";
import { db } from "../lib/firebase";
import { Tenant } from "../types";

export const StripePlans = {
  starter: "price_1SoZ6p4YnWSDKFky1MPxkfES", // Substitua pelo ID real do Stripe (29€)
  business: "price_1SoZ7q4YnWSDKFkyVKJ2dc0f" // Substitua pelo ID real do Stripe (49€)
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

    // 2. SEGURANÇA PARA NOVAS CONTAS (Evitar race conditions no Firestore)
    // Se a subscrição ainda não existe mas o tenant foi criado agora mesmo (últimos 30 min)
    const createdAt = tenant.created_at?.toDate?.() || new Date(tenant.created_at);
    const now = new Date();
    const diffCreation = now.getTime() - createdAt.getTime();
    
    if (!tenant.subscription && diffCreation < 1000 * 60 * 30) {
      return { hasAccess: true, isTrial: true, daysLeft: 14 };
    }

    // 3. VERIFICAÇÃO DE ASSINATURA EXISTENTE
    if (!tenant.subscription) {
      return { hasAccess: false, isTrial: false, daysLeft: 0 };
    }
    
    // Tratamento robusto da data de fim de trial
    let trialEnd: Date;
    const rawEnd = tenant.subscription.trial_ends_at;
    
    if (rawEnd?.toDate) {
      trialEnd = rawEnd.toDate();
    } else if (rawEnd instanceof Date) {
      trialEnd = rawEnd;
    } else if (typeof rawEnd === 'string' || typeof rawEnd === 'number') {
      trialEnd = new Date(rawEnd);
    } else {
      // Fallback: se não houver data válida, usamos 14 dias a partir da criação
      trialEnd = new Date(createdAt);
      trialEnd.setDate(trialEnd.getDate() + 14);
    }
    
    const isTrial = tenant.subscription.status === 'trialing';
    const isActive = ['active', 'past_due'].includes(tenant.subscription.status);
    
    // Cálculo preciso de dias restantes
    const diffTime = trialEnd.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Tem acesso se for trial com dias restantes OU se for conta paga ativa
    const hasAccess = (isTrial && daysLeft >= 0) || isActive;

    return { 
      hasAccess, 
      isTrial, 
      daysLeft: Math.max(0, daysLeft) 
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
