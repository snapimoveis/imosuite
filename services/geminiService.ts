
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export const generatePropertyDescription = async (property: any, tone: string = 'formal'): Promise<{ curta: string; completa: string }> => {
  // Inicialização conforme diretrizes: named parameter apiKey
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
  - Usa parágrafos (\n\n) para a descrição completa.
  Instrução de Estilo: ${toneInstructions}`;

  const prompt = `Gera duas descrições para este imóvel: ${JSON.stringify({
    titulo: property.titulo,
    tipo: property.tipo_imovel,
    tipologia: property.tipologia,
    localizacao: property.localizacao,
    areas: property.areas,
    divisoes: property.divisoes,
    caracteristicas: property.caracteristicas
  })}. 
  Retorna estritamente um objeto JSON com os campos "curta" e "completa".`;

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
    
    // Acesso direto à propriedade .text conforme diretrizes
    const text = response.text || "";
    
    // Extração robusta de JSON
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonString = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonString);
    }
    
    throw new Error("Formato de resposta inválido.");
  } catch (error) {
    console.error("Erro Gemini:", error);
    return {
      curta: "Imóvel de excelência com ótimas áreas e localização privilegiada.",
      completa: "Este imóvel destaca-se pelo seu excelente estado de conservação e áreas generosas. Localizado numa zona calma e com bons acessos, oferece o conforto ideal para a sua família.\n\nComposto por divisões bem iluminadas e acabamentos de qualidade, esta é a oportunidade que procurava no mercado. Agende já a sua visita."
    };
  }
};

export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gera um slogan curto e memorável em PT-PT para a imobiliária "${agencyName}". Retorna apenas o texto do slogan sem aspas.`,
    });
    return response.text?.trim().replace(/^"|"$/g, '') || "A sua agência de confiança.";
  } catch { 
    return "Excelência no mercado imobiliário."; 
  }
};
