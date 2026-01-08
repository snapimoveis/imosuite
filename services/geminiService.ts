
import { GoogleGenAI } from "@google/genai";

export const generatePropertyDescription = async (property: any): Promise<string> => {
  // Always initialize right before use as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Crie uma descrição atraente e profissional para um imóvel com as seguintes características:
    Título: ${property.titulo}
    Tipo: ${property.tipo_imovel}
    Tipologia: ${property.tipologia}
    Localização: ${property.concelho}, ${property.distrito}
    Características: ${property.caracteristicas.join(', ')}
    Preço: ${property.preco ? property.preco + '€' : 'Sob consulta'}
    
    A descrição deve ser em Português de Portugal (PT-PT), focada em benefícios, e dividida em 3 parágrafos:
    1. Introdução impactante.
    2. Detalhes técnicos e áreas.
    3. Conclusão convidativa para visita.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // .text is a property getter, not a function
    return response.text || "Não foi possível gerar a descrição automática neste momento.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Não foi possível gerar a descrição automática neste momento.";
  }
};
