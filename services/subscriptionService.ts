
import { collection, addDoc, onSnapshot, query, limit } from "@firebase/firestore";
import { db } from "../lib/firebase";
import { Tenant } from "../types";

/**
 * IMPORTANTE: Use apenas IDs que começam por 'price_'. 
 * IDs que começam por 'prod_' NÃO funcionam aqui.
 */
export const StripePlans = {
  starter: "price_1StarterID_ReplaceMe", // Substitua pelo ID real: price_...
  business: "price_1BusinessID_ReplaceMe" // Substitua pelo ID real: price_...
};

export const SubscriptionService = {
  /**
   * Verifica se o tenant tem acesso às funcionalidades administrativas
   */
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

  /**
   * Inicia o processo de Checkout do Stripe
   */
  createCheckoutSession: async (userId: string, priceId: string) => {
    if (!userId) throw new Error("Utilizador não autenticado.");
    
    // Validação de segurança para evitar o erro de Product vs Price ID
    if (!priceId.startsWith('price_')) {
      throw new Error(`ID Inválido: enviou '${priceId}'. O ID deve começar com 'price_'. Verifique o Dashboard do Stripe no separador Preços.`);
    }

    console.log(`Iniciando checkout para o user ${userId} com o preço ${priceId}`);

    const checkoutSessionsRef = collection(db, "users", userId, "checkout_sessions");
    
    try {
      const docRef = await addDoc(checkoutSessionsRef, {
        price: priceId,
        success_url: window.location.origin + "/#/admin?session=success",
        cancel_url: window.location.origin + "/#/admin/settings?tab=billing&session=cancel",
        allow_promotion_codes: true,
        subscription_data: {
          metadata: {
              source: 'imosuite_app',
              user_id: userId
          }
        }
      });

      return new Promise((resolve, reject) => {
        // Timeout de 15 segundos para evitar ficar "congelado" se a extensão não responder
        const timeout = setTimeout(() => {
          unsubscribe();
          reject(new Error("A extensão do Stripe não respondeu. Verifique se a extensão está instalada no Firebase e se a API Key do Stripe é válida."));
        }, 15000);

        const unsubscribe = onSnapshot(docRef, (snap) => {
          const data = snap.data() as any;
          if (data?.error) {
            clearTimeout(timeout);
            unsubscribe();
            reject(new Error(data.error.message));
          }
          if (data?.url) {
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
    } catch (err) {
      console.error("Erro na criação do documento de checkout:", err);
      throw err;
    }
  }
};
