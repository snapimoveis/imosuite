
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/**
 * Gera descrições profissionais para imóveis em Portugal seguindo os critérios do ImoSuite.
 */
export const generatePropertyDescription = async (property: any): Promise<{ curta: string; completa: string; hashtags_opcionais: string[] }> => {
  // Always use {apiKey: process.env.API_KEY} for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `És um especialista em marketing imobiliário em Portugal. Escreves descrições persuasivas, realistas e profissionais em Português de Portugal (PT-PT). Nunca uses termos do Brasil (como banheiro, geladeira, aluguel, gramado). Usa obrigatoriamente: casa de banho, frigorífico, arrendamento, relvado.`;

  const prompt = `Tarefa: Gerar 2 versões de texto para um anúncio imobiliário em Portugal:
  1) Descrição curta (até 350 caracteres)
  2) Descrição completa (600–1200 caracteres) em português de Portugal, com tom comercial profissional e formal.

  Regras:
  - NÃO inventar dados. Se algo não estiver nos dados, não mencionar.
  - NÃO prometer garantias (“o melhor”, “imperdível”) sem suporte.
  - Se certificado energético estiver ausente, escrever “Certificado energético: em processamento”.
  - Se morada não for para expor, não mencionar rua/porta; usar apenas zona (freguesia/concelho).
  - Se operação for arrendamento, usar obrigatoriamente o termo "Arrendamento".
  - Incluir CTA final (“Agende a sua visita” / “Peça mais informações”).
  - Estrutura da descrição completa: Abertura com benefício principal, 3–6 bullets de destaques, Parágrafo final com localização + CTA.

  Dados do imóvel (JSON): ${JSON.stringify(property)}

  Output em JSON: { "curta": "...", "completa": "...", "hashtags_opcionais": ["#imoveisportugal", "..."] }`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            curta: { 
              type: Type.STRING, 
              description: "Descrição curta de até 350 caracteres." 
            },
            completa: { 
              type: Type.STRING, 
              description: "Descrição detalhada entre 600 e 1200 caracteres em PT-PT." 
            },
            hashtags_opcionais: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Hashtags relevantes para o mercado português."
            },
          },
          required: ["curta", "completa", "hashtags_opcionais"],
          propertyOrdering: ["curta", "completa", "hashtags_opcionais"],
        },
      },
    });
    
    const text = response.text;
    return JSON.parse(text || "{}");
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    throw new Error("Falha ao gerar texto com IA. Verifique os dados do imóvel.");
  }
};

export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gera um slogan comercial curto e impactante em Português de Portugal (PT-PT) para a imobiliária "${agencyName}". Apenas o texto.`,
      config: {
        systemInstruction: "És um especialista em branding imobiliário em Portugal."
      }
    });
    return response.text?.trim().replace(/"/g, '') || "A sua agência de confiança.";
  } catch { 
    return "Líderes em soluções imobiliárias."; 
  }
};
