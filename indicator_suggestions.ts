import { GoogleGenAI, Type } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function calculateVolatility(closes: number[]): number {
  if (closes.length < 2) return 0;
  const mean = closes.reduce((acc, val) => acc + val, 0) / closes.length;
  const variance = closes.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / closes.length;
  const stdDev = Math.sqrt(variance);
  // Coefficient of Variation as a normalized measure of volatility
  return stdDev / mean;
}

export async function suggestIndicators(candles:any[]){
  if (!candles || candles.length < 20) return []

  const closes = candles.map(c => c.close);
  const volatility = calculateVolatility(closes.slice(-30)); // Analyze last 30 periods

  let marketCondition = 'normal trending';
  if (volatility > 0.05) {
      marketCondition = 'high volatility';
  } else if (volatility < 0.015) {
      marketCondition = 'low volatility / ranging';
  }

  
  const schema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: 'The indicator name and parameters, e.g., "RSI(14)".' },
            description: { type: Type.STRING, description: 'A brief explanation of why this indicator is suggested.' }
        },
        required: ['name', 'description']
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
        throw new Error("AI returned an empty response for indicator suggestions.");
    }
    return JSON.parse(text);
  } catch(e) {
    console.error("Error in suggestIndicators:", e);
    if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
    }
    // Fallback to simple logic on AI failure
    if (marketCondition === 'high volatility') {
        return [
            { name: 'Bollinger Bands(20, 2)', description: 'Effective for identifying breakouts in volatile markets.' },
            { name: 'EMA(20)', description: 'A shorter-term EMA can help track price in volatile conditions.' }
        ];
    }
    return [
        { name: 'RSI(14)', description: 'Identifies overbought/oversold conditions in ranging markets.' },
        { name: 'SMA(50)', description: 'A longer-term SMA helps identify the primary trend.' }
    ];
  }
}