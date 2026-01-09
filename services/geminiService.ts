
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/**
 * Gera descrições profissionais para imóveis em Portugal.
 */
export const generatePropertyDescription = async (property: any): Promise<{ curta: string; completa: string; hashtags: string[] }> => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Chave API do Gemini não encontrada no sistema.");

  // Inicialização no momento do uso para evitar erros de ciclo de vida do browser
  const ai = new GoogleGenAI({ apiKey });
  
  const ctx = {
    titulo: property.titulo,
    tipo: property.tipo_imovel,
    tipologia: property.tipologia,
    operacao: property.operacao,
    local: property.localizacao?.concelho,
    caract: property.caracteristicas || []
  };

  const prompt = `
    Como especialista imobiliário em Portugal, gera uma descrição para o anúncio:
    ${JSON.stringify(ctx)}
    
    Regras:
    - Português de Portugal (PT-PT).
    - Versão Curta: máx 350 carac.
    - Versão Completa: Markdown estruturado.
    - Tom profissional e persuasivo.
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
    console.error("Gemini Error:", error);
    throw new Error(error.message || "A IA não conseguiu processar o pedido.");
  }
};

export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Excelência imobiliária.";
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um slogan comercial em português para a imobiliária "${agencyName}". Apenas o texto.`,
    });
    return response.text?.trim() || "A sua imobiliária de confiança.";
  } catch { return "Excelência no mercado."; }
};
