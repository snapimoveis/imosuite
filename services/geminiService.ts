
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

/**
 * Gera descrições profissionais para imóveis usando o Gemini 3 Flash.
 * A chave API é obtida exclusivamente de process.env.API_KEY.
 */
export const generatePropertyDescription = async (property: any): Promise<{ curta: string; completa: string; hashtags: string[] }> => {
  // Inicialização obrigatória conforme as diretrizes
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const propertyContext = {
    titulo: property.titulo,
    ref: property.ref,
    tipo: property.tipo_imovel,
    tipologia: property.tipologia,
    estado: property.estado_conservacao,
    operacao: property.operacao,
    arrendamento_tipo: property.arrendamento_tipo,
    preco: property.financeiro?.preco_venda || property.financeiro?.preco_arrendamento,
    area_util: property.areas?.area_util_m2,
    divisoes: property.divisoes,
    localizacao: {
      concelho: property.localizacao?.concelho,
      freguesia: property.localizacao?.freguesia,
      distrito: property.localizacao?.distrito,
      expor_morada: property.localizacao?.expor_morada
    },
    caracteristicas: property.caracteristicas || [],
    certificado_energetico: property.certificacao?.certificado_energetico
  };

  const prompt = `
    És um especialista em marketing imobiliário em Portugal. Escreves descrições persuasivas, realistas e conformes, sem inventar características.

    Tarefa:
    Gerar 2 versões de texto para um anúncio imobiliário:
    1) Descrição curta (até 350 caracteres)
    2) Descrição completa (600–1200 caracteres) em português de Portugal, com tom comercial profissional.

    Regras:
    - NÃO inventar dados. Se algo não estiver nos dados, não mencionar.
    - NÃO prometer garantias (“o melhor”, “imperdível”) sem suporte.
    - Se certificado energético estiver ausente ou for "Em preparação", escrever “Certificado energético: a confirmar”.
    - Se morada não for para expor (expor_morada: false), não mencionar rua/porta; usar apenas zona (freguesia/concelho).
    - Se operação for arrendamento, mencionar tipo de arrendamento (residencial/temporário/férias) e condições fornecidas (caução, despesas).
    - Incluir CTA final (“Agende a sua visita” / “Peça informações”).
    - Otimizar para SEO com palavras naturais (tipologia + concelho + tipo de imóvel), sem keyword stuffing.
    - Estrutura da descrição completa:
      - Abertura com benefício principal
      - 3–6 bullets de destaques
      - Parágrafo final com localização (zona) + CTA

    Dados do imóvel (JSON):
    ${JSON.stringify(propertyContext)}
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
              description: 'Descrição curta para listagens.',
            },
            completa: {
              type: Type.STRING,
              description: 'Descrição detalhada em Markdown.',
            },
            hashtags_opcionais: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Hashtags para redes sociais.',
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
      hashtags: result.hashtags_opcionais || []
    };
  } catch (error) {
    console.error("Gemini Property Description Error:", error);
    throw new Error("Erro ao comunicar com a IA. Verifique a configuração da API Key.");
  }
};

/**
 * Gera um slogan para a agência.
 */
export const generateAgencySlogan = async (agencyName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Gere um slogan comercial curto e impactante para a imobiliária "${agencyName}" em Portugal. Retorne apenas o texto.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "A sua imobiliária de confiança.";
  } catch {
    return "Excelência no mercado imobiliário.";
  }
};
