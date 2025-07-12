import { GoogleGenAI, Type } from "@google/genai";
import { PuzzleData, WordHint } from '../types.ts';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

const generatePuzzleWithRetry = async (seed: string, attempt = 1): Promise<PuzzleData[]> => {
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
    
    // Basic validation
    if (puzzle.length !== 4 || puzzle.some(p => p.words.length !== 4)) {
        console.warn(`Invalid puzzle format on attempt ${attempt}, retrying...`);
        return generatePuzzleWithRetry(seed, attempt + 1);
    }
    
    // Uniqueness validation
    const allWords = puzzle.flatMap(p => p.words.map(w => w.toUpperCase()));
    const uniqueWords = new Set(allWords);
    if (allWords.length !== uniqueWords.size) {
        console.warn(`Duplicate words found in puzzle on attempt ${attempt}, retrying...`);
        return generatePuzzleWithRetry(seed, attempt + 1);
    }

    return puzzle;
};

export const generateNewPuzzle = async (seed: string): Promise<PuzzleData[]> => {
  try {
    return await generatePuzzleWithRetry(seed);
  } catch (error) {
    console.error("Error generating new puzzle:", error);
    throw new Error("Failed to generate a new puzzle. Please try again.");
  }
};

export const getWordHint = async (unsolvedGroups: {category: string, words: string[], level: number}[]): Promise<WordHint> => {
    const systemInstruction = "You are an assistant for a word connection game. Your task is to provide a single, helpful hint word. The user will provide a list of unsolved groups of words. Your response must be only a single word from one of those groups. Do not include any other text, explanation, or punctuation. Just the word.";

    const userPrompt = `Here are the remaining unsolved categories and their words: ${JSON.stringify(unsolvedGroups.map(g => g.words))}. Pick one word from any of these groups and return only that word.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        const hintWordText = response.text.trim().split(' ')[0].toUpperCase();

        for (const group of unsolvedGroups) {
            const wordInGroup = group.words.find(w => w.toUpperCase() === hintWordText);
            if (wordInGroup) {
                return { text: wordInGroup, level: group.level };
            }
        }
        // Fallback if Gemini returns a word not in the list (should be rare)
        const randomGroup = unsolvedGroups[Math.floor(Math.random() * unsolvedGroups.length)];
        const randomWord = randomGroup.words[Math.floor(Math.random() * randomGroup.words.length)];
        return { text: randomWord, level: randomGroup.level };

    } catch(e) {
        console.error("Error getting word hint from Gemini:", e);
        throw new Error("Could not get a word hint at this time.");
    }
};

export const getCategoryHint = async (unsolvedGroups: {category: string, words: string[], level: number}[]): Promise<string> => {
    const systemInstruction = "You are an assistant for a word connection game. Your task is to provide a single, helpful category name as a hint. The user will provide a list of unsolved categories. Your response must be only one of the category names from the list provided. Do not include any other text, explanation, or punctuation. Just the category name.";

    const userPrompt = `Here are the remaining unsolved categories: ${JSON.stringify(unsolvedGroups.map(g => g.category))}. Pick one category name from this list and return only that category name.`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        
        const hintCategoryText = response.text.trim().toUpperCase();
        const matchingCategory = unsolvedGroups.find(g => g.category.toUpperCase() === hintCategoryText);

        if (matchingCategory) {
            return matchingCategory.category;
        }

        // Fallback if Gemini hallucinates a category name
        return unsolvedGroups[Math.floor(Math.random() * unsolvedGroups.length)].category;

    } catch(e) {
        console.error("Error getting category hint from Gemini:", e);
        throw new Error("Could not get a category hint at this time.");
    }
};