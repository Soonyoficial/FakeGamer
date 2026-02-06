
import { GoogleGenAI, Type, Modality } from "@google/genai";

export const getGameInsight = async (gameTitle: string): Promise<any> => {
  try {
    // Initialize inside the function to ensure the most up-to-date API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Proporciona información útil y consejos profesionales para el juego "${gameTitle}". Incluye por qué es tendencia y un consejo secreto 100% útil.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tip: { type: Type.STRING, description: "Un consejo pro-gamer 100% útil." },
            whyTrending: { type: Type.STRING, description: "Breve explicación de por qué es tendencia." },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
          },
          required: ["tip", "whyTrending", "difficulty"]
        }
      }
    });
    // response.text is a getter property, do not call as a method
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error fetching Gemini insight:", error);
    return {
      tip: "Domina los movimientos básicos antes de intentar combos complejos.",
      whyTrending: "Gran actualización de temporada reciente.",
      difficulty: "Medium"
    };
  }
};

export const chatWithThinking = async (prompt: string, history: any[] = []) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return response;
};

export const searchGrounding = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return response;
};

export const analyzeVideoContent = async (videoTitle: string, summary: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analiza profundamente este video titulado "${videoTitle}" con el siguiente resumen: "${summary}". Extrae estrategias avanzadas y detalles técnicos que un jugador profesional notaría.`,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  // response.text is a getter property
  return response.text;
};

export const editGameImage = async (base64Image: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/png',
          },
        },
        { text: prompt },
      ],
    },
  });
  
  // Iterate through parts to find the generated image data
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
