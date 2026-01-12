
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
  checkAccess: (tenant: Tenant): { hasAccess: boolean; isTrial: boolean; daysLeft: number } => {
    if (!tenant.subscription) return { hasAccess: false, isTrial: false, daysLeft: 0 };
    
    const now = new Date();
    const trialEnd = tenant.subscription.trial_ends_at?.toDate?.() || new Date(tenant.subscription.trial_ends_at);
    
    const isTrial = tenant.subscription.status === 'trialing';
    const isActive = ['active', 'past_due'].includes(tenant.subscription.status);
    
    const diffTime = trialEnd.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Tem acesso se estiver no trial (mesmo com dias negativos, dependendo da sua tolerância)
    // ou se tiver uma subscrição ativa.
    const hasAccess = (isTrial && daysLeft > 0) || isActive;

    return { hasAccess, isTrial, daysLeft: Math.max(0, daysLeft) };
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
        trial_period_days: 0, // Como já teve trial no tenant, aqui cobramos direto
        metadata: {
            source: 'imosuite_app'
        }
      }
    });

    // Esperar pelo URL de redirecionamento do Stripe gerado pela extensão
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
