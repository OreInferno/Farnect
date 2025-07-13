
import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface WordHint {
    text: string;
    level: number;
}

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
    
    const systemInstruction = "You are an assistant for a word connection game. Your task is to provide a single, helpful hint word. The user will provide a list of unsolved groups of words. Your response must be only a single word from one of those groups. Do not include any other text, explanation, or punctuation. Just the word.";
    const userPrompt = `Here are the remaining unsolved categories and their words: ${JSON.stringify(unsolvedGroups.map((g: any) => g.words))}. Pick one word from any of these groups and return only that word.`;

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        const hintWordText = response.text.trim().split(' ')[0].toUpperCase();

        for (const group of unsolvedGroups) {
            const wordInGroup = (group.words as string[]).find(w => w.toUpperCase() === hintWordText);
            if (wordInGroup) {
                const hint: WordHint = { text: wordInGroup, level: group.level };
                return res.status(200).json({ hint });
            }
        }
        
        // Fallback
        const randomGroup = unsolvedGroups[Math.floor(Math.random() * unsolvedGroups.length)];
        const randomWord = randomGroup.words[Math.floor(Math.random() * randomGroup.words.length)];
        const hint: WordHint = { text: randomWord, level: randomGroup.level };
        return res.status(200).json({ hint });

    } catch(e) {
        console.error("Error getting word hint:", e);
        return res.status(500).json({ error: 'Could not get a word hint at this time.' });
    }
}
