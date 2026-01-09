
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/**
 * Gera descrições profissionais para imóveis usando o Gemini 3 Flash.
 * Chave obtida via process.env.API_KEY injetada no build/runtime.
 */
export const generatePropertyDescription = async (property: any): Promise<{ curta: string; completa: string; hashtags: string[] }> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("Configuração da IA em falta (API_KEY). Verifique as variáveis de ambiente no Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const propertyContext = {
    titulo: property.titulo,
    tipo: property.tipo_imovel,
    tipologia: property.tipologia,
    concelho: property.localizacao?.concelho,
    distrito: property.localizacao?.distrito,
    preco: property.financeiro?.preco_venda || property.financeiro?.preco_arrendamento,
    caracteristicas: property.caracteristicas || []
  };

  const prompt = `
    És um redator imobiliário experiente em Portugal. 
    Gera uma descrição curta (até 350 carac.) e uma completa (Markdown) para este imóvel.
    Utiliza português de Portugal (PT-PT).
    
    Dados: ${JSON.stringify(propertyContext)}
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
    console.error("Erro Gemini:", error);
    throw new Error(error.message || "Erro na comunicação com a IA.");
  }
};

export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "A sua imobiliária de confiança.";
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um slogan curto para a imobiliária "${agencyName}" em Portugal. Retorne apenas o texto.`,
    });
    return response.text?.trim() || "Excelência no mercado imobiliário.";
  } catch {
    return "A sua imobiliária de confiança.";
  }
};
