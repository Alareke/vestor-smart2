import { GoogleGenAI, Type } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const coordinatesSchema = {
    type: Type.OBJECT,
    properties: {
        start: { 
            type: Type.OBJECT,
            properties: {
                time: { type: Type.STRING, description: 'The time (date string) for the starting point.' },
                price: { type: Type.NUMBER, description: 'The price for the starting point.' }
            },
            required: ['time', 'price']
        },
        end: { 
            type: Type.OBJECT,
            properties: {
                time: { type: Type.STRING, description: 'The time (date string) for the ending point.' },
                price: { type: Type.NUMBER, description: 'The price for the ending point.' }
            },
            required: ['time', 'price']
        }
    },
    required: ['start', 'end']
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAIAssistedDrawing(toolType: 'trendline' | 'fib-retracement', priceData: any[]) {
     if (!priceData || priceData.length < 20) {
        throw new Error("Not enough data for AI assistance.");
    }

    const recentData = priceData.slice(-120).map(p => ({ time: p.time, high: p.high, low: p.low }));
    
    if (toolType === 'trendline') {
    } else { // fib-retracement
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            const result = await ai.models.generateContent({
                config: {
                    responseMimeType: "application/json",
                    responseSchema: coordinatesSchema,
                },
            });

            const text = result.text;
            if (!text || text.trim() === '') {
                 throw new Error("AI returned an empty response. This could be due to content safety filters.");
            }
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error("Failed to parse AI drawing JSON:", parseError, "Raw text:", text);
                throw new Error("Received malformed data from the AI. Please try again.");
            }

            // Validate that the returned times exist in the data to prevent chart errors
            const allTimes = new Set(priceData.map(p => p.time));
            if (!allTimes.has(data.start.time) || !allTimes.has(data.end.time)) {
                console.warn("AI returned coordinates with timestamps not present in the original data.", data);
                throw new Error("AI returned invalid coordinates. Please try again.");
            }

            return data;
        } catch(e) {
            console.warn(`Attempt ${attempt + 1} for AI-assisted ${toolType} failed:`, e);

            if (e.message && e.message.includes('429') && attempt < maxRetries - 1) {
                const delay = Math.pow(2, attempt + 1) * 1000; // Exponential backoff: 2s, 4s
                console.log(`Rate limit hit. Retrying in ${delay / 1000} seconds...`);
                await sleep(delay);
            } else {
                if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
                }
                // Re-throw the original, more specific error
                throw e;
            }
            attempt++;
        }
    }
    // This will be reached if all retries fail
    throw new Error(`AI drawing assistance failed after ${maxRetries} attempts.`);
}