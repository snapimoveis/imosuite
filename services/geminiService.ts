
import { GoogleGenAI } from "@google/genai";

// Generate a professional property description based on provided details
export const generatePropertyDescription = async (property: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Crie uma descrição atraente, profissional e persuasiva para um imóvel em Portugal:
    
    DADOS COMERCIAIS:
    Título: ${property.titulo}
    Operação: ${property.tipo_negocio} ${property.tipo_arrendamento ? '(' + property.tipo_arrendamento + ')' : ''}
    Preço: ${property.preco || property.preco_arrendamento}€
    
    CARACTERÍSTICAS TÉCNICAS:
    Tipo: ${property.tipo_imovel}
    Tipologia: ${property.tipologia}
    Estado: ${property.estado_conservacao}
    Áreas: ${property.area_util_m2}m² úteis, ${property.area_bruta_m2}m² brutos
    Divisões: ${property.quartos} quartos, ${property.casas_banho} WCs
    Extras: ${property.caracteristicas?.join(', ')}
    Piscina: ${property.tem_piscina ? 'Sim' : 'Não'} | Jardim: ${property.tem_jardim ? 'Sim' : 'Não'}
    
    LOCALIZAÇÃO:
    Concelho: ${property.concelho}
    Distrito: ${property.distrito}
    
    REQUISITOS DO TEXTO:
    - Português de Portugal (PT-PT)
    - Formato Markdown
    - Estrutura:
      1. Título apelativo em H2.
      2. Introdução focada no estilo de vida e localização.
      3. Corpo com detalhes técnicos organizados por pontos.
      4. Conclusão forte com Call to Action para visita.
    - Tom: Profissional, sofisticado e confiante.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Não foi possível gerar a descrição automática neste momento.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Não foi possível gerar a descrição automática neste momento.";
  }
};

// Generate a short and memorable commercial slogan for the agency
export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Crie um slogan comercial curto, memorável e profissional para uma imobiliária chamada "${agencyName}".
    O slogan deve ser em Português de Portugal (PT-PT), focado em confiança, sonhos e excelência no serviço imobiliário.
    Retorne apenas a frase do slogan, sem aspas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "A chave do seu futuro.";
  } catch (error) {
    console.error("AI Slogan Generation Error:", error);
    return "A chave do seu futuro.";
  }
};
