import { GoogleGenAI, Type } from "@google/genai";
import { FARMS } from '../constants';
import { Itinerary, Farm } from '../types';

// NOTE: In a real app, strict handling of env vars is needed.
// For this demo, we assume process.env.API_KEY is available.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateItinerary = async (userRequest: string): Promise<Itinerary | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  const model = "gemini-2.5-flash";

  const farmContext = FARMS.map(f => ({
    id: f.id,
    name: f.name,
    specialty: f.specialty,
    products: f.products.map(p => p.name).join(", "),
    location: f.address
  }));

  const systemInstruction = `
    Sei un esperto concierge digitale per "TerreFVG", una rete di aziende agricole in Friuli Venezia Giulia.
    Il tuo obiettivo è creare itinerari turistici brevi (max 3 tappe) basati sulla richiesta dell'utente.
    Usa SOLO le aziende fornite nel contesto.
    Sii persuasivo e spiega perché hai scelto ogni tappa.
  `;

  const prompt = `
    Dati delle aziende (Database JSON):
    ${JSON.stringify(farmContext)}

    Richiesta Utente: "${userRequest}"

    Genera un itinerario JSON valido.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Titolo accattivante dell'itinerario" },
            description: { type: Type.STRING, description: "Breve descrizione generale dell'esperienza" },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  farmId: { type: Type.STRING, description: "ID dell'azienda corrispondente" },
                  reason: { type: Type.STRING, description: "Motivo per cui visitare questa tappa specifico per l'utente" }
                },
                required: ["farmId", "reason"]
              }
            }
          },
          required: ["title", "description", "steps"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Itinerary;
    }
    return null;

  } catch (error) {
    console.error("Error generating itinerary:", error);
    return null;
  }
};

export interface TravelAdviceResult {
  text: string;
  groundingChunks?: any[];
}

export const getTravelAdvice = async (userLat: number, userLng: number, targetFarmId: string): Promise<TravelAdviceResult> => {
  if (!apiKey) return { text: "Chiave API mancante." };

  const targetFarm = FARMS.find(f => f.id === targetFarmId);
  if (!targetFarm) return { text: "Impossibile trovare le informazioni sulla destinazione." };

  const model = "gemini-2.5-flash";
  
  const prompt = `
    L'utente si trova alle coordinate: ${userLat}, ${userLng}.
    La destinazione è l'azienda agricola: "${targetFarm.name}" situata a "${targetFarm.address}".
    
    Usa Google Maps per verificare la posizione reale e il traffico tipico o le strade principali.
    Fornisci un consiglio breve (max 3 frasi) su come raggiungere la destinazione, indicando la direzione e il tipo di strada (es. autostrada, strada di montagna).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        // Note: responseMimeType cannot be JSON when using googleMaps tool
      }
    });

    return {
      text: response.text || "Non sono riuscito a calcolare il percorso.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };

  } catch (e) {
    console.error("Error getting travel advice", e);
    return { text: "Errore durante il calcolo dei consigli di viaggio." };
  }
};