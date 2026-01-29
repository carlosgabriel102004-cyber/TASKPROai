
import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeTaskPrompt(prompt: string) {
  try {
    const apiKey = process.env.API_KEY || "";
    if (!apiKey) {
      console.warn("Gemini API Key não configurada.");
      return null;
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise a seguinte tarefa e sugira uma prioridade (Baixa, Média, Alta) e um rótulo adequado. Tarefa: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPriority: { type: Type.STRING, description: "Baixa, Média ou Alta" },
            suggestedLabel: { type: Type.STRING, description: "Uma categoria curta como Trabalho, Casa, Saúde, etc." },
            estimatedMinutes: { type: Type.NUMBER, description: "Tempo estimado em minutos" }
          },
          required: ["suggestedPriority", "suggestedLabel"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Erro ao analisar tarefa com Gemini:", error);
    return null;
  }
}
