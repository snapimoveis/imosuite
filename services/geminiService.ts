
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Gera uma descrição atraente para um imóvel usando o Gemini 3 Flash.
 */
export const generatePropertyDescription = async (property: any): Promise<string> => {
  // Always initialize GoogleGenAI with a named parameter using process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Crie uma descrição atraente e sofisticada para um anúncio imobiliário em Portugal:
    
    DADOS DO IMÓVEL:
    Título: ${property.titulo}
    Tipo: ${property.tipo_imovel} (${property.tipologia})
    Estado: ${property.estado_conservacao}
    Operação: ${property.operacao}
    Preço: ${property.financeiro?.preco_venda || property.financeiro?.preco_arrendamento}€
    
    DETALHES TÉCNICOS:
    Área Útil: ${property.areas?.area_util_m2}m²
    Divisões: ${property.divisoes?.quartos} quartos, ${property.divisoes?.casas_banho} casas de banho
    Garagem: ${property.divisoes?.garagem?.tem ? 'Sim, ' + property.divisoes?.garagem?.lugares + ' lugares' : 'Não'}
    Localização: ${property.localizacao?.concelho}, ${property.localizacao?.distrito}
    Extras: ${property.caracteristicas?.join(', ')}
    
    REQUISITOS DO TEXTO:
    - Português de Portugal (PT-PT)
    - Formato Markdown profissional
    - Inclua um título H2 chamativo
    - Destaque o estilo de vida e conforto
    - Call to action no final convidando para visita
  `;

  try {
    // Correct method: ai.models.generateContent with model and contents properties
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Correct property access: .text directly (not a method)
    return response.text || "Erro ao gerar descrição.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar a descrição automática. Por favor, escreva manualmente.";
  }
};

/**
 * Gera um slogan para a agência imobiliária.
 */
export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Gere um slogan comercial curto para a imobiliária "${agencyName}" em Portugal. Foco em confiança.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Correct property access: .text
    return response.text?.trim() || "O seu parceiro de confiança.";
  } catch {
    return "A sua imobiliária de referência.";
  }
};
