
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export const generatePropertyDescription = async (property: any, tone: string = 'formal'): Promise<{ curta: string; completa: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const toneInstructions = {
    formal: "Usa um tom sério, profissional e focado em factos.",
    casual: "Usa um tom leve, acolhedor e emocional.",
    luxo: "Usa um tom sofisticado, exclusivo e aspiracional."
  }[tone] || "Usa um tom profissional.";

  const systemInstruction = `És um especialista em marketing imobiliário em Portugal. Escreves em Português de Portugal (PT-PT). 
  Regras: Usa 'casa de banho', 'arrendamento', 'frigorífico'. Nunca uses termos do Brasil.
  Instrução de Estilo: ${toneInstructions}`;

  const prompt = `Tarefa: Gerar 2 descrições para este imóvel:
  1) Curta: até 350 caracteres.
  2) Completa: 600 a 1200 caracteres.

  Dados: ${JSON.stringify(property)}
  
  Retorna APENAS um objeto JSON com as chaves "curta" e "completa".`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            curta: { type: Type.STRING },
            completa: { type: Type.STRING }
          },
          required: ["curta", "completa"],
        },
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("IA não retornou conteúdo.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro Gemini:", error);
    throw new Error("Falha na geração de IA.");
  }
};

export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gera um slogan curto para a imobiliária "${agencyName}" em PT-PT.`,
    });
    return response.text?.trim() || "A sua agência de confiança.";
  } catch { 
    return "Excelência imobiliária."; 
  }
};
