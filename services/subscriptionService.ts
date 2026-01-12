
import { collection, addDoc, onSnapshot, query, limit } from "@firebase/firestore";
import { db } from "../lib/firebase";
import { Tenant } from "../types";

/**
 * CONFIGURAÇÃO DA EXTENSÃO STRIPE
 * De acordo com a sua imagem, a coleção está configurada como 'customers'.
 */
const STRIPE_ROOT_COLLECTION = "customers"; 

/**
 * IMPORTANTE: Substitua pelos IDs reais que começam por 'price_' do seu Stripe.
 * Verifique se está em Test Mode (price_...test...) ou Live Mode.
 */
export const StripePlans = {
starter: "price_1SoZ6p4YnWSDKFky1MPxkfES", // Substitua pelo ID real: price_...
business: "price_1SoZ7q4YnWSDKFkyVKJ2dc0f" // Substitua pelo ID real: price_...
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
    
    if (!priceId.startsWith('price_')) {
      throw new Error(`ID Inválido: '${priceId}'. Certifique-se que copiou o PRICE ID (não o Product ID) do Dashboard do Stripe.`);
    }

    console.log(`[STRIPE] Tentando criar checkout em: ${STRIPE_ROOT_COLLECTION}/${userId}/checkout_sessions`);
    const checkoutSessionsRef = collection(db, STRIPE_ROOT_COLLECTION, userId, "checkout_sessions");
    
    try {
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

      console.log(`[STRIPE] Documento ${docRef.id} criado. Aguardando processamento da Cloud Function...`);

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          unsubscribe();
          reject(new Error("Timeout: A extensão não respondeu. 1. Verifique os logs da função no Firebase. 2. Confirme que as regras de segurança permitem ler/escrever na coleção 'customers'."));
        }, 25000);

        const unsubscribe = onSnapshot(docRef, (snap) => {
          const data = snap.data() as any;
          if (!data) return;

          if (data.error) {
            clearTimeout(timeout);
            unsubscribe();
            console.error("[STRIPE] Erro retornado pela extensão:", data.error);
            reject(new Error(`Erro Stripe: ${data.error.message}`));
          }
          if (data.url) {
            clearTimeout(timeout);
            unsubscribe();
            console.log("[STRIPE] Sucesso! Redirecionando para:", data.url);
            window.location.assign(data.url);
            resolve(true);
          }
        }, (err) => {
          clearTimeout(timeout);
          unsubscribe();
          console.error("[STRIPE] Erro no listener do documento:", err);
          reject(err);
        });
      });
    } catch (err: any) {
      console.error("[STRIPE] Erro ao criar documento inicial:", err);
      if (err.code === 'permission-denied') {
        throw new Error("Erro de Permissão: O seu Firestore não permite escrever na coleção 'customers'. Atualize as regras no Firebase Console.");
      }
      throw err;
    }
  }
};
