
import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { unsolvedGroups } = req.body;
     if (!unsolvedGroups || !Array.isArray(unsolvedGroups)) {
        return res.status(400).json({ error: 'unsolvedGroups is required' });
    }

    const systemInstruction = "You are an assistant for a word connection game. Your task is to provide a single, helpful category name as a hint. The user will provide a list of unsolved categories. Your response must be only one of the category names from the list provided. Do not include any other text, explanation, or punctuation. Just the category name.";
    const userPrompt = `Here are the remaining unsolved categories: ${JSON.stringify(unsolvedGroups.map((g: any) => g.category))}. Pick one category name from this list and return only that category name.`;
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        const hintCategoryText = response.text.trim().toUpperCase();
        const matchingCategory = unsolvedGroups.find((g: any) => g.category.toUpperCase() === hintCategoryText);

        if (matchingCategory) {
            return res.status(200).json({ hint: matchingCategory.category });
        }

        // Fallback
        const hint = unsolvedGroups[Math.floor(Math.random() * unsolvedGroups.length)].category;
        return res.status(200).json({ hint });

    } catch(e) {
        console.error("Error getting category hint:", e);
        return res.status(500).json({ error: 'Could not get a category hint at this time.' });
    }
}
