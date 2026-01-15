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
   DESCRIÇÃO DE IMÓVEL (PROMPT ROBUSTO)
============================================================ */

export const generatePropertyDescription = async (
  property: PropertyInput,
  tone: Tone = "formal"
): Promise<{ curta: string; completa: string }> => {
  const toneMap: Record<Tone, string> = {
    formal: `
Tom profissional, informativo e objetivo.
Adequado para portais imobiliários, investidores e documentação técnica.
`,
    casual: `
Tom acessível, acolhedor e emocional.
Foco no estilo de vida, conforto e bem-estar.
`,
    luxo: `
Tom sofisticado, aspiracional e exclusivo.
Vocabulário premium, foco em diferenciação e valor percebido.
`,
  };

  const systemInstruction = `
És um especialista sénior em marketing imobiliário em Portugal, com experiência em:
- Portais imobiliários (Idealista, Imovirtual, Casa Sapo)
- Conversão comercial e copywriting
- SEO imobiliário em Português de Portugal (PT-PT)

REGRAS OBRIGATÓRIAS:
1. Escreve EXCLUSIVAMENTE em Português de Portugal (PT-PT)
2. Nunca uses Português do Brasil
3. Termos obrigatórios:
   - "casa de banho" (nunca "banheiro")
   - "arrendamento" (nunca "aluguel")
   - "rés-do-chão" (nunca "térreo")
4. Não inventes dados técnicos
5. Se alguma informação não existir, simplesmente omite
6. Texto natural, humano e comercial (não robótico)
7. Evita repetições
8. Não uses emojis
9. Não uses listas com bullets na descrição completa

ESTRUTURA DA RESPOSTA:
- "curta": frase de impacto com no máximo 200 caracteres
- "completa": texto estruturado em 3 a 5 parágrafos, com espaçamento (\n\n)

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
Criar uma descrição comercial realista, clara e persuasiva para publicação online.

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
                  "Descrição curta (máx. 200 caracteres) para destaque em listagens.",
              },
              completa: {
                type: Type.STRING,
                description:
                  "Descrição detalhada com vários parágrafos, tom comercial e foco nos pontos fortes.",
              },
            },
            required: ["curta", "completa"],
          },
        },
      });

    if (!response.text) {
      throw new Error("Resposta vazia do Gemini.");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro Gemini (descrição de imóvel):", error);

    // Fallback seguro
    return {
      curta: `${property.titulo ?? "Imóvel"} em ${
        property.localizacao?.concelho ?? "localização atrativa"
      }.`,
      completa: `Este ${property.tipo_imovel ?? "imóvel"} situa-se em ${
        property.localizacao?.concelho ?? "zona de elevada procura"
      }, oferecendo uma solução equilibrada entre funcionalidade e conforto.

Com ${
        property.divisoes?.quartos ?? 0
      } quartos e ${
        property.divisoes?.casas_banho ?? 0
      } casas de banho, adapta-se a diferentes perfis de utilização, seja para habitação própria ou investimento.

Uma excelente oportunidade para quem procura qualidade, localização e potencial de valorização.`,
    };
  }
};

/* ============================================================
   SLOGAN IMOBILIÁRIA (PROMPT ROBUSTO)
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
- Tom institucional e credível
- Fácil de memorizar
- Não uses aspas
`,
    });

    return (
      response.text?.trim().replace(/^"|"$/g, "") ||
      "A sua imobiliária de confiança."
    );
  } catch (error) {
    console.error("Erro Gemini (slogan):", error);
    return "Excelência no mercado imobiliário.";
  }
};
