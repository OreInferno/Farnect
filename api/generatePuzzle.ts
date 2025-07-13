
import { GoogleGenAI, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PuzzleData {
  category: string;
  words: string[];
}

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "The name of the category for the four words. e.g. 'TYPES OF FISH' or 'WORDS THAT FOLLOW 'FIRE''"
      },
      words: {
        type: Type.ARRAY,
        description: "An array of exactly four unique, single words that belong to the category.",
        items: { type: Type.STRING }
      }
    },
    required: ["category", "words"]
  }
};

const generatePuzzleWithRetry = async (ai: GoogleGenAI, seed: string, attempt = 1): Promise<PuzzleData[]> => {
    if (attempt > 3) {
        throw new Error("Failed to generate a valid puzzle after multiple attempts.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a 'Connections' style puzzle based on this seed: ${seed}. Create four highly distinct categories, each with four unique, single-word answers. The categories should have varying levels of difficulty. Do not use the same word in multiple categories. The first category should be the easiest, and the last the hardest.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const puzzle = JSON.parse(jsonText) as PuzzleData[];
    
    if (puzzle.length !== 4 || puzzle.some(p => p.words.length !== 4)) {
        console.warn(`Invalid puzzle format on attempt ${attempt}, retrying...`);
        return generatePuzzleWithRetry(ai, seed, attempt + 1);
    }
    
    const allWords = puzzle.flatMap(p => p.words.map(w => w.toUpperCase()));
    const uniqueWords = new Set(allWords);
    if (allWords.length !== uniqueWords.size) {
        console.warn(`Duplicate words found in puzzle on attempt ${attempt}, retrying...`);
        return generatePuzzleWithRetry(ai, seed, attempt + 1);
    }

    return puzzle;
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { seed } = req.body;
    if (!seed) {
        return res.status(400).json({ error: 'Seed is required' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const puzzle = await generatePuzzleWithRetry(ai, seed);
        return res.status(200).json({ puzzle });
    } catch (error) {
        console.error('Error generating puzzle:', error);
        return res.status(500).json({ error: (error as Error).message });
    }
}
