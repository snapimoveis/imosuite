
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Tenant } from "../types";

/**
 * CONFIGURAÇÃO DA EXTENSÃO STRIPE
 */
const STRIPE_ROOT_COLLECTION = "customers"; 

/**
 * IDs DE PREÇO DO STRIPE REAIS
 */
export const StripePlans = {
  starter: "price_1SobVF9YE7qSVg1quKIHx0qM",  
  business: "price_1SocAG9YE7qSVg1qMZW1jjcE"
};

export const SubscriptionService = {
  checkAccess: (tenant: Tenant, userEmail?: string | null): { hasAccess: boolean; isTrial: boolean; daysLeft: number } => {
    if (userEmail === 'snapimoveis@gmail.com') {
      return { hasAccess: true, isTrial: true, daysLeft: 999 };
    }

    const now = new Date();
    let createdAt: Date;
    
    if (tenant.created_at?.toDate) {
      createdAt = tenant.created_at.toDate();
    } else if (typeof tenant.created_at === 'string' || typeof tenant.created_at === 'number') {
      createdAt = new Date(tenant.created_at);
    } else {
      createdAt = new Date();
    }

    const diffCreationMs = now.getTime() - createdAt.getTime();
    if (diffCreationMs < 1000 * 60 * 60) {
      return { hasAccess: true, isTrial: true, daysLeft: 14 };
    }

    if (!tenant.subscription) {
      return { hasAccess: false, isTrial: false, daysLeft: 0 };
    }
    
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
    
    if (isTrial && (!trialEnd || isNaN(trialEnd.getTime()))) {
      trialEnd = new Date(createdAt);
      trialEnd.setDate(trialEnd.getDate() + 14);
    }

    let daysLeft = 0;
    let expired = true;

    if (trialEnd) {
      const diffMs = trialEnd.getTime() - now.getTime();
      expired = diffMs < 0;
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const hasAccess = isActive || (isTrial && !expired) || (diffCreationMs < 1000 * 60 * 60);

    return { hasAccess, isTrial, daysLeft: expired ? 0 : daysLeft };
  },

  createCheckoutSession: async (userId: string, priceId: string) => {
    if (!userId) throw new Error("Utilizador não autenticado.");
    
    if (!priceId || priceId.includes('placeholder') || priceId.includes('EXEMPLO')) {
      const msg = "Erro de Configuração: O ID do plano no código ainda é um exemplo. Por favor, configure os Price IDs reais do Stripe no ficheiro subscriptionService.ts.";
      console.error(msg);
      throw new Error(msg);
    }

    const checkoutSessionsRef = collection(db, STRIPE_ROOT_COLLECTION, userId, "checkout_sessions");
    
    try {
      const docRef = await addDoc(checkoutSessionsRef, {
        price: priceId,
        success_url: window.location.origin + "/#/admin?session=success",
        cancel_url: window.location.origin + "/#/admin/settings?tab=billing&session=cancel",
        allow_promotion_codes: true,
        trial_from_plan: true,
        metadata: { user_id: userId, source: 'imosuite_web' }
      });

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          unsubscribe();
          reject(new Error("O Stripe demorou demasiado tempo. Verifique a sua ligação ou a configuração da extensão no Firebase."));
        }, 30000);

        const unsubscribe = onSnapshot(docRef, (snap) => {
          const data = snap.data() as any;
          if (!data) return;

          if (data.error) {
            clearTimeout(timeout);
            unsubscribe();
            console.error("[STRIPE ERROR]", data.error);
            const errorMsg = data.error.message.includes('No such price') 
              ? "Este plano não existe na sua conta Stripe. Verifique o Price ID." 
              : `Erro Stripe: ${data.error.message}`;
            reject(new Error(errorMsg));
          }
          
          if (data.url) {
            clearTimeout(timeout);
            unsubscribe();
            window.location.assign(data.url);
            resolve(true);
          }
        }, (err) => {
          clearTimeout(timeout);
          unsubscribe();
          reject(err);
        });
      });
    } catch (err: any) {
      console.error("Erro ao iniciar checkout:", err);
      throw err;
    }
  }
};
