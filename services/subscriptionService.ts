
import { collection, addDoc, onSnapshot, query, limit } from "@firebase/firestore";
import { db } from "../lib/firebase";
import { Tenant } from "../types";

/**
 * IMPORTANTE: Substitua estes IDs pelos IDs reais do seu Dashboard do Stripe (Produto -> Preço)
 */
export const StripePlans = {
  starter: "prod_Tm7LyBsSaBGIz2", // Preço: 29€
  business: "prod_Tm7MKWkIVoxLvP" // Preço: 49€
};

export const SubscriptionService = {
  /**
   * Verifica se o tenant tem acesso às funcionalidades administrativas
   */
  checkAccess: (tenant: Tenant, userEmail?: string | null): { hasAccess: boolean; isTrial: boolean; daysLeft: number } => {
    // 1. BYPASS PARA ADMINISTRADOR MASTER (Snap Imóveis)
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
      createdAt = new Date(); // Fallback imediato
    }

    // 3. SEGURANÇA PARA CONTAS NOVAS (Grace Period de 1 hora)
    // Evita que o utilizador seja bloqueado se o Firestore ainda não propagou os dados da subscrição
    const diffCreationMs = now.getTime() - createdAt.getTime();
    if (diffCreationMs < 1000 * 60 * 60) {
      return { hasAccess: true, isTrial: true, daysLeft: 14 };
    }

    // 4. VERIFICAÇÃO DE ASSINATURA EXISTENTE
    if (!tenant.subscription) {
      return { hasAccess: false, isTrial: false, daysLeft: 0 };
    }
    
    // 5. TRATAMENTO DA DATA DE FIM DE TRIAL
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
    
    // Se for Trial mas a data for inválida, assume-se 14 dias após criação
    if (isTrial && (!trialEnd || isNaN(trialEnd.getTime()))) {
      trialEnd = new Date(createdAt);
      trialEnd.setDate(trialEnd.getDate() + 14);
    }

    // 6. CÁLCULO DE DIAS E ESTADO DE ACESSO
    let daysLeft = 0;
    let expired = true;

    if (trialEnd) {
      const diffMs = trialEnd.getTime() - now.getTime();
      expired = diffMs < 0;
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Tem acesso se:
    // - Subscrição Paga estiver ativa
    // - OU Estiver em Trial e a data ainda não passou
    // - OU For uma conta criada há menos de 1 hora (Grace Period)
    const hasAccess = isActive || (isTrial && !expired) || (diffCreationMs < 1000 * 60 * 60);

    return { 
      hasAccess, 
      isTrial, 
      daysLeft: expired ? 0 : daysLeft 
    };
  },

  /**
   * Inicia o processo de Checkout do Stripe
   * Requer a extensão "Run Subscription Payments with Stripe" instalada no Firebase
   */
  createCheckoutSession: async (userId: string, priceId: string) => {
    if (!userId) throw new Error("Utilizador não autenticado.");

    const checkoutSessionsRef = collection(db, "users", userId, "checkout_sessions");
    
    const docRef = await addDoc(checkoutSessionsRef, {
      price: priceId,
      success_url: window.location.origin + "/#/admin?session=success",
      cancel_url: window.location.origin + "/#/admin/billing?session=cancel",
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 0, // O trial é gerido manualmente pela nossa app no início
        metadata: {
            source: 'imosuite_app',
            user_id: userId
        }
      }
    });

    // Aguarda que a extensão do Stripe gere o URL de redirecionamento
    const unsubscribe = onSnapshot(docRef, (snap) => {
      const data = snap.data() as any;
      if (data?.error) {
        unsubscribe();
        alert(`Erro Stripe: ${data.error.message}`);
      }
      if (data?.url) {
        unsubscribe();
        window.location.assign(data.url);
      }
    });
  }
};
