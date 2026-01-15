import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/* ============================================================
   CONFIGURAÇÃO GEMINI (VITE / FRONTEND)
============================================================ */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

if (!GEMINI_API_KEY) {
  throw new Error(
    "VITE_GEMINI_API_KEY não encontrada. Verifique o .env ou o Vercel."
  );
}

const gemini = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

/* ============================================================
   TIPOS
============================================================ */

type Tone = "formal" | "casual" | "luxo";

interface PropertyInput {
  titulo?: string;
  tipo_imovel?: string;
  tipologia?: string;
  estado?: string;
  localizacao?: {
    concelho?: string;
    distrito?: string;
    zona?: string;
  };
  areas?: {
    area_total?: number;
    area_util?: number;
  };
  divisoes?: {
    quartos?: number;
    casas_banho?: number;
  };
  caracteristicas?: string[];
}

/* ============================================================
   CTA PADRÃO (GARANTIDO)
============================================================ */

const CTA_PADRAO =
  "Não perca esta oportunidade. Contacte-nos e agende já a sua visita.";

/* ============================================================
   DESCRIÇÃO DE IMÓVEL (PROMPT ROBUSTO + CTA)
============================================================ */

export const generatePropertyDescription = async (
  property: PropertyInput,
  tone: Tone = "formal"
): Promise<{ curta: string; completa: string }> => {
  const toneMap: Record<Tone, string> = {
    formal: `
Tom profissional, informativo e objetivo.
Adequado para portais imobiliários e investidores.
`,
    casual: `
Tom acolhedor e próximo.
Foco no conforto, estilo de vida e bem-estar.
`,
    luxo: `
Tom sofisticado, exclusivo e aspiracional.
Vocabulário premium e foco na diferenciação.
`,
  };

  const systemInstruction = `
És um especialista sénior em marketing imobiliário em Portugal.

REGRAS OBRIGATÓRIAS:
1. Escreve exclusivamente em Português de Portugal (PT-PT)
2. Nunca uses Português do Brasil
3. Usa sempre:
   - "casa de banho"
   - "arrendamento"
   - "rés-do-chão"
4. Não inventes dados
5. Se faltar informação, omite
6. Texto natural, humano e comercial
7. Não uses emojis nem listas
8. Usa parágrafos com espaçamento (\n\n)

REGRA OBRIGATÓRIA DE FECHO:
- O ÚLTIMO parágrafo da descrição completa DEVE ser um call to action.
- O call to action deve convidar explicitamente a contactar ou marcar visita.
- Usa apenas UM call to action.

Exemplos de call to action válidos:
- "Não perca esta oportunidade. Contacte-nos e agende já a sua visita."
- "Descubra pessoalmente este imóvel. Agende a sua visita."
- "Entre em contacto connosco e marque a sua visita."

ESTILO:
${toneMap[tone]}
`.trim();

  const prompt = `
IMÓVEL:
${JSON.stringify(
  {
    titulo: property.titulo,
    tipo: property.tipo_imovel,
    tipologia: property.tipologia,
    estado: property.estado,
    localizacao: property.localizacao,
    areas: property.areas,
    divisoes: property.divisoes,
    caracteristicas: property.caracteristicas,
  },
  null,
  2
)}

OBJETIVO:
Criar uma descrição imobiliária clara, realista e persuasiva para publicação online.

RETORNA ESTRITAMENTE UM OBJETO JSON VÁLIDO.
`.trim();

  try {
    const response: GenerateContentResponse =
      await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              curta: {
                type: Type.STRING,
                description:
                  "Descrição curta (máx. 200 caracteres).",
              },
              completa: {
                type: Type.STRING,
                description:
                  "Descrição completa com vários parágrafos e CTA final.",
              },
            },
            required: ["curta", "completa"],
          },
        },
      });

    if (!response.text) {
      throw new Error("Resposta vazia do Gemini.");
    }

    const result = JSON.parse(response.text) as {
      curta: string;
      completa: string;
    };

    /* ========================================================
       BLINDAGEM FINAL — GARANTE CTA
    ======================================================== */

    if (!result.completa.toLowerCase().includes("visita")) {
      result.completa = `${result.completa.trim()}\n\n${CTA_PADRAO}`;
    }

    return result;
  } catch (error) {
    console.error("Erro Gemini (descrição imóvel):", error);

    // Fallback seguro com CTA
    return {
      curta: `${property.titulo ?? "Imóvel"} em ${
        property.localizacao?.concelho ?? "localização atrativa"
      }.`,
      completa: `Este ${property.tipo_imovel ?? "imóvel"} situa-se em ${
        property.localizacao?.concelho ?? "zona de elevada procura"
      }, oferecendo uma solução equilibrada entre conforto e funcionalidade.

Com ${property.divisoes?.quartos ?? 0} quartos e ${
        property.divisoes?.casas_banho ?? 0
      } casas de banho, adapta-se a diferentes perfis de utilização.

${CTA_PADRAO}`,
    };
  }
};

/* ============================================================
   SLOGAN IMOBILIÁRIA
============================================================ */

export const generateAgencySlogan = async (
  agencyName: string
): Promise<string> => {
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
Cria um slogan curto, profissional e memorável em Português de Portugal (PT-PT)
para a imobiliária "${agencyName}".

Regras:
- Máximo 8 palavras
- Tom institucional
- Não uses aspas
`,
    });

    return (
      response.text?.trim().replace(/^"|"$/g, "") ||
      "A sua imobiliária de confiança."
    );
  } catch {
    return "Excelência no mercado imobiliário.";
  }
};
