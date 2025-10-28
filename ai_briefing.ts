import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateBriefing(stockSymbol: string, priceData: any[], indicators: any[]) {
    if (!stockSymbol || !priceData || priceData.length < 30) {
        throw new Error("Insufficient data for AI briefing.");
    }
    
    const recentData = priceData.slice(-90).map(p => ({ time: p.time, close: p.close.toFixed(2) }));
    const indicatorList = indicators.length > 0 ? indicators.map(ind => `${ind.name}(${ind.periods.join(',')})`).join(', ') : 'No active indicators';

        Generate a comprehensive analyst briefing for the stock symbol ${stockSymbol}.
        Use the provided recent price data and active indicators for technical analysis, and use Google Search for news and upcoming events.
        Format the output as a single, raw JSON object. Do not include markdown formatting (like \`\`\`json) or any text outside of the JSON object.

        The JSON object must have the following structure and content based on these descriptions:
        {
          "market_snapshot": "A one-sentence summary of the current market sentiment for the stock (e.g., 'TSLA is currently showing bullish sentiment...').",
          "key_drivers": ["An array of up to 3 strings, where each string is a key driver moving the stock today, based on recent news."],
          "technical_outlook": {
            "summary": "A brief 2-3 sentence summary of the technical analysis based on price data.",
            "support": "A string representing the key support level price.",
            "resistance": "A string representing the key resistance level price."
          },
          "upcoming_events": ["An array of up to 2 strings, each describing a relevant upcoming economic event that could impact the stock (e.g., 'CPI data release', 'Fed meeting')."],
          "indicator_synopsis": "A plain-language summary of what the currently active indicators on the chart are suggesting. Mention each indicator by name."
        }

        - Stock: ${stockSymbol}
        - Recent Price Data (last 90 periods): ${JSON.stringify(recentData)}
        - Active Indicators: ${indicatorList}
    `;

    try {
        const result = await ai.models.generateContent({
            config: {
                tools: [{googleSearch: {}}]
            },
        });
        
        const rawText = result.text;
        if (!rawText || rawText.trim() === '') {
            throw new Error("AI returned an empty response for the briefing.");
        }

        let jsonText = rawText.trim();
        // The model might still wrap the JSON in markdown, so we clean it.
        const jsonMatch = jsonText.match(/{[\s\S]*}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        }

        try {
            return JSON.parse(jsonText);
        } catch (parseError) {
            console.error("Failed to parse briefing JSON:", parseError, "Processed text:", jsonText);
            throw new Error("AI returned malformed data for the briefing.");
        }
    } catch (e) {
        console.error("Error generating AI briefing:", e);
        if (e.message && (e.message.includes('429') || e.message.includes('quota'))) {
        }
        throw new Error("Failed to generate AI analyst briefing. The model may be unavailable or the request timed out.");
    }
}