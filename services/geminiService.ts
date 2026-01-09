
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/**
 * Gera descrições profissionais para imóveis em Portugal seguindo os critérios do ImoSuite.
 */
export const generatePropertyDescription = async (property: any): Promise<{ curta: string; completa: string; hashtags: string[] }> => {
  // Acesso direto via process.env conforme as diretrizes obrigatórias
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Configuração da VITE_GEMINI_API_KEY não detetada no ambiente.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Extração de contexto para a IA
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
    - Público-alvo: ${ctx.publico_alvo}.
    - Tom: Profissional, sofisticado e focado no estilo de vida.
    - Estrutura: Destaca a localização (${ctx.local}) e os extras (${ctx.caract.join(', ')}).
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
            curta: { 
              type: Type.STRING, 
              description: "Resumo para SEO e redes sociais, máximo 350 caracteres." 
            },
            completa: { 
              type: Type.STRING, 
              description: "Descrição completa em formato Markdown, com parágrafos e bullets." 
            },
            hashtags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
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
    throw new Error("A IA não conseguiu gerar o texto. Verifique a ligação ou a chave API.");
  }
};

/**
 * Gera slogans para a agência baseados no nome comercial.
 */
export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "Excelência no mercado imobiliário.";
  
  const ai = new GoogleGenAI({ apiKey });
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
