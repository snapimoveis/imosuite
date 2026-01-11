import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export const generatePropertyDescription = async (property: any, tone: string = 'formal'): Promise<{ curta: string; completa: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const toneInstructions = {
    formal: "Usa um tom sério, profissional e focado em factos técnicos.",
    casual: "Usa um tom leve, acolhedor e focado no estilo de vida.",
    luxo: "Usa um tom sofisticado, exclusivo e aspiracional."
  }[tone] || "Usa um tom profissional.";

  const systemInstruction = `És um especialista em marketing imobiliário em Portugal. Escreves exclusivamente em Português de Portugal (PT-PT). 
  Regras: 
  - Usa 'casa de banho' em vez de 'banheiro'.
  - Usa 'arrendamento' em vez de 'aluguel'.
  - Usa 'rés-do-chão' em vez de 'térreo'.
  Instrução de Estilo: ${toneInstructions}`;

  const prompt = `Gera duas descrições (curta e completa) para o seguinte imóvel: ${JSON.stringify(property)}. 
  Retorna um objeto JSON com os campos "curta" e "completa".`;

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
            curta: { type: Type.STRING, description: "Descrição curta até 300 caracteres" },
            completa: { type: Type.STRING, description: "Descrição detalhada com parágrafos" }
          },
          required: ["curta", "completa"],
        },
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("A IA não retornou conteúdo.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro Gemini:", error);
    return {
      curta: "Imóvel de excelência com ótimas áreas e localização privilegiada.",
      completa: "Este imóvel destaca-se pelo seu excelente estado de conservação e áreas generosas. Localizado numa zona calma e com bons acessos, oferece o conforto ideal para a sua família. Agende já a sua visita."
    };
  }
};

export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gera um slogan curto e impactante em PT-PT para a imobiliária "${agencyName}". Retorna apenas o texto do slogan.`,
    });
    return response.text?.trim() || "A sua confiança é o nosso compromisso.";
  } catch { 
    return "Excelência no mercado imobiliário."; 
  }
};