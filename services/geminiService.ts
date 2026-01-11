
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/**
 * Gera descrições profissionais para imóveis em Portugal seguindo os critérios do ImoSuite.
 */
export const generatePropertyDescription = async (property: any, tone: string = 'formal'): Promise<{ curta: string; completa: string; hashtags_opcionais: string[] }> => {
  // Inicialização obrigatória dentro da função para garantir captura da API Key do ambiente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const toneInstructions = {
    formal: "Usa um tom sério, profissional e focado em factos, ideal para investidores e clientes corporativos.",
    casual: "Usa um tom leve, acolhedor e emocional, destacando o conforto e o potencial para criar memórias em família.",
    luxo: "Usa um tom sofisticado, exclusivo e aspiracional, enfatizando a nobreza dos materiais, o prestígio da localização e o estilo de vida premium."
  }[tone] || "Usa um tom profissional.";

  const systemInstruction = `És um especialista em marketing imobiliário em Portugal. Escreves descrições persuasivas, realistas e profissionais em Português de Portugal (PT-PT). 
  Instrução de Estilo: ${toneInstructions}
  Nunca uses termos do Brasil (como banheiro, geladeira, aluguel, gramado). Usa obrigatoriamente: casa de banho, frigorífico, arrendamento, relvado.`;

  const prompt = `Tarefa: Gerar 2 versões de texto para um anúncio imobiliário em Portugal baseando-se nos dados reais fornecidos:
  1) Descrição curta (até 350 caracteres)
  2) Descrição completa (600–1200 caracteres) com estrutura comercial profissional.

  Dados Relevantes para incluir:
  - Localização: Referir a zona (${property.localizacao?.concelho || 'Portugal'}) de forma atrativa.
  - Características: Valorizar os pontos fortes como ${property.caracteristicas?.join(', ') || 'as divisões do imóvel'}.
  - Comodidades: Mencionar ${property.divisoes?.quartos} quartos, ${property.divisoes?.casas_banho} casas de banho e área de ${property.areas?.area_util_m2}m².

  Regras:
  - NÃO inventar dados. Se algo não estiver nos dados, não mencionar.
  - Se certificado energético estiver ausente, escrever “Certificado energético: em processamento”.
  - Se operação for arrendamento, usar obrigatoriamente o termo "Arrendamento".
  - Output em JSON estrito.

  Dados do imóvel (JSON): ${JSON.stringify(property)}

  Output em JSON: { "curta": "...", "completa": "...", "hashtags_opcionais": ["#imoveisportugal", "..."] }`;

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
            completa: { type: Type.STRING },
            hashtags_opcionais: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["curta", "completa", "hashtags_opcionais"],
        },
      },
    });
    
    if (!response.text) throw new Error("A IA não retornou texto.");
    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    throw new Error("Erro na IA: Certifique-se que a variável 'API_KEY' está configurada no Vercel.");
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
