
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/**
 * Gera descrições profissionais para imóveis em Portugal seguindo os critérios do ImoSuite.
 */
export const generatePropertyDescription = async (property: any): Promise<{ curta: string; completa: string; hashtags: string[] }> => {
  // Always use {apiKey: process.env.API_KEY} for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const ctx = {
    titulo: property.titulo,
    tipo: property.tipo_imovel,
    tipologia: property.tipologia,
    operacao: property.operacao,
    local: `${property.localizacao?.concelho}, ${property.localizacao?.distrito}`,
    caract: property.caracteristicas || [],
    areas: property.areas,
    publico_alvo: property.operacao === 'venda' ? 'Investidores ou Famílias para habitação própria' : 'Arrendatários de longo prazo ou temporários'
  };

  const systemInstruction = `Atua como um copywriter imobiliário de luxo em Portugal. 
  O teu objetivo é criar descrições persuasivas, elegantes e profissionais. 
  Utiliza Português de Portugal (PT-PT) exclusivamente (ex: 'casa de banho' em vez de 'banheiro', 'arrendamento' em vez de 'aluguel').
  Foca-te no estilo de vida e nas vantagens competitivas do imóvel.`;

  const prompt = `Gera uma descrição para o seguinte imóvel: ${JSON.stringify(ctx)}`;

  try {
    // Using gemini-3-pro-preview for complex text tasks
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
              description: "Uma frase curta e impactante para listagens." 
            },
            completa: { 
              type: Type.STRING, 
              description: "Descrição detalhada com parágrafos bem estruturados." 
            },
            hashtags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Hashtags relevantes para redes sociais."
            },
          },
          propertyOrdering: ["curta", "completa", "hashtags"],
        },
      },
    });
    
    // Use the .text property directly (getter)
    const text = response.text;
    return JSON.parse(text || "{}");
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    throw new Error("Falha ao gerar texto com IA. Verifique os dados do imóvel.");
  }
};

export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  // Always use {apiKey: process.env.API_KEY} for initialization
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um slogan comercial curto e impactante (PT-PT) para a imobiliária "${agencyName}". Apenas o texto.`,
      config: {
        systemInstruction: "És um especialista em branding imobiliário em Portugal."
      }
    });
    // Use .text property directly as per guidelines
    return response.text?.trim().replace(/"/g, '') || "A sua agência de confiança.";
  } catch { 
    return "Líderes em soluções imobiliárias."; 
  }
};
