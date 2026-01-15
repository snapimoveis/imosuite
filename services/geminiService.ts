
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export const generatePropertyDescription = async (property: any, tone: string = 'formal'): Promise<{ curta: string; completa: string }> => {
  // Inicialização rigorosa com process.env.API_KEY conforme diretrizes
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

  const prompt = `Gera duas descrições (curta e completa) para este imóvel: ${JSON.stringify({
    titulo: property.titulo,
    tipo: property.tipo_imovel,
    tipologia: property.tipologia,
    localizacao: property.localizacao,
    areas: property.areas,
    divisoes: property.divisoes,
    caracteristicas: property.caracteristicas
  })}. 
  Retorna estritamente um objeto JSON.`;

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
            curta: { type: Type.STRING, description: "Descrição curta (máx 200 carateres) para slogan de catálogo." },
            completa: { type: Type.STRING, description: "Descrição detalhada com vários parágrafos realçando os pontos fortes." }
          },
          required: ["curta", "completa"],
        },
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("A IA não retornou texto.");

    // Parse direto pois usamos responseMimeType e responseSchema
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro Crítico Gemini:", error);
    // Fallback amigável caso a API falhe por limites de quota ou rede
    return {
      curta: `${property.titulo} em ${property.localizacao?.concelho || 'excelente localização'}.`,
      completa: `Este excelente ${property.tipo_imovel} destaca-se pelas suas áreas generosas e localização privilegiada em ${property.localizacao?.concelho}.\n\nComposto por ${property.divisoes?.quartos || 0} quartos e ${property.divisoes?.casas_banho || 0} casas de banho, oferece o conforto ideal para a sua família. Agende já a sua visita para conhecer todos os detalhes deste imóvel.`
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
