import { GoogleGenAI, Type } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function detectPatternsAI(candles:any[], opts:any={}){
    if (!candles || candles.length < 30) {
        console.warn("Not enough data for pattern detection.");
        return [];
    }
    
    const recentData = candles.slice(-120).map(c => ({ time: c.time, open: c.open.toFixed(2), high: c.high.toFixed(2), low: c.low.toFixed(2), close: c.close.toFixed(2) }));

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: 'The name of the identified chart pattern.' },
                at: { type: Type.STRING, description: 'The end date (time property) of the pattern formation.' }
            },
            required: ['name', 'at']
        }
    };
    
    try {
        const result = await ai.models.generateContent({
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            },
        });
        const text = result.text;
        if (!text || text.trim() === '') {
            throw new Error("AI returned an empty response for pattern detection.");
        }
        return JSON.parse(text);
    } catch(e) {
        console.error("Error in detectPatternsAI:", e);
        if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
        }
        throw new Error("AI pattern detection failed.");
    }
}