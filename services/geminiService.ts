
import { GoogleGenAI, Type } from "@google/genai";

// Always use a named parameter and direct process.env.API_KEY reference for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameInsight = async (gameTitle: string): Promise<any> => {
  try {
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

    // Access the 'text' property directly to extract the generated content.
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

export const getLiveChatAnalysis = async (chatMessages: string[]): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analiza estos mensajes de chat de un stream en vivo y resume el sentimiento general y los temas principales: ${chatMessages.join(", ")}`,
      });
      // Access the 'text' property directly to extract the generated content.
      return response.text || "El chat está emocionado por la jugada actual.";
    } catch (e) {
      return "Audiencia activa y positiva.";
    }
}
