
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/**
 * Gera descrições profissionais para imóveis em Portugal seguindo os critérios do ImoSuite.
 */
export const generatePropertyDescription = async (property: any): Promise<{ curta: string; completa: string; hashtags: string[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
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

  const prompt = `
    Atua como um redator imobiliário premium em Portugal. 
    Gera uma descrição para o seguinte imóvel:
    ${JSON.stringify(ctx)}
    
    Requisitos Obrigatórios:
    - Linguagem: Português de Portugal (PT-PT).
    - Tom: Profissional e sofisticado.
    - Estrutura: Destaca a localização (${ctx.local}) e extras.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            curta: { type: Type.STRING },
            completa: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["curta", "completa"],
        },
      },
    });
    
    const result = JSON.parse(response.text || "{}");
    return {
      curta: result.curta || "",
      completa: result.completa || "",
      hashtags: result.hashtags || []
    };
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    throw new Error("Falha na comunicação com a IA. Verifique a configuração da chave.");
  }
};

export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um slogan comercial curto e impactante (PT-PT) para a imobiliária "${agencyName}". Apenas o texto.`,
    });
    return response.text?.trim().replace(/"/g, '') || "A sua agência de confiança.";
  } catch { 
    return "Líderes em soluções imobiliárias."; 
  }
};
