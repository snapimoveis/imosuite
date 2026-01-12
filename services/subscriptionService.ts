
import { collection, addDoc, onSnapshot } from "@firebase/firestore";
import { db } from "../lib/firebase";
import { Tenant } from "../types";

/**
 * CONFIGURAÇÃO DA EXTENSÃO STRIPE
 * Mantenha como 'customers' conforme configurado no seu Firebase Console.
 */
const STRIPE_ROOT_COLLECTION = "customers"; 

/**
 * IDs DE PREÇO REAIS (STRIPE LIVE PRICE IDs)
 * IMPORTANTE: Substitua os IDs abaixo pelos IDs que criou no Dashboard do Stripe em MODO REAL.
 * O erro "No such price" acontece quando usa um ID de teste numa conta live ou vice-versa.
 */
export const StripePlans = {
  starter: "price_1SobVF9YE7qSVg1quKIHx0qM",
  business: "price_1SocAG9YE7qSVg1qMZW1jjcE"
};

export const SubscriptionService = {
  /**
   * Verifica se o tenant tem acesso às funcionalidades administrativas
   */
  checkAccess: (tenant: Tenant, userEmail?: string | null): { hasAccess: boolean; isTrial: boolean; daysLeft: number } => {
    // Bypass para conta mestre de suporte
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

    // Janela de cortesia de 1 hora para novos registos (evita bloqueio imediato)
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
    
    // Fallback para trial inicial se os dados da subscrição ainda não sincronizaram
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
    
    // Verificação de segurança para garantir que o ID é válido
    if (!priceId || priceId.includes('Aqui') || priceId.includes('ReplaceMe')) {
      throw new Error("Configuração de Preços incompleta. Por favor, configure os Price IDs de produção.");
    }

    const checkoutSessionsRef = collection(db, STRIPE_ROOT_COLLECTION, userId, "checkout_sessions");
    
    try {
      // Criar o documento que a extensão do Stripe vai ler
      const docRef = await addDoc(checkoutSessionsRef, {
        price: priceId,
        success_url: window.location.origin + "/#/admin?session=success",
        cancel_url: window.location.origin + "/#/admin/settings?tab=billing&session=cancel",
        allow_promotion_codes: true,
        trial_from_plan: true,
        metadata: {
          user_id: userId,
          source: 'imosuite_web'
        }
      });

      // Aguardar que a extensão processe e adicione o campo 'url'
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          unsubscribe();
          reject(new Error("O gateway de pagamento demorou demasiado a responder. Verifique os logs da extensão no Firebase."));
        }, 30000);

        const unsubscribe = onSnapshot(docRef, (snap) => {
          const data = snap.data() as any;
          if (!data) return;

          if (data.error) {
            clearTimeout(timeout);
            unsubscribe();
            console.error("[STRIPE ERROR]", data.error);
            reject(new Error(`Erro Stripe: ${data.error.message}`));
          }
          
          if (data.url) {
            clearTimeout(timeout);
            unsubscribe();
            // Redirecionar para o Checkout do Stripe
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
      console.error("Erro ao iniciar sessão de pagamento:", err);
      throw err;
    }
  }
};
