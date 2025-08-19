
import { PuzzleData, WordHint } from '../types';

const callApi = async <T>(endpoint: string, body: object): Promise<T> => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
    }
    return response.json();
}

export const generateNewPuzzle = async (seed: string): Promise<PuzzleData[]> => {
  try {
    const { puzzle } = await callApi<{ puzzle: PuzzleData[] }>('/api/generatePuzzle', { seed });
    return puzzle;
  } catch (error) {
    console.error("Error generating new puzzle:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to generate a new puzzle. Please try again.");
  }
};

export const getWordHint = async (unsolvedGroups: {category: string, words: string[], level: number}[]): Promise<WordHint> => {
    try {
        const { hint } = await callApi<{ hint: WordHint }>('/api/getWordHint', { unsolvedGroups });
        return hint;
    } catch (e) {
        console.error("Error getting word hint from API:", e);
        if (e instanceof Error) throw e;
        throw new Error("Could not get a word hint at this time.");
    }
};

export const getCategoryHint = async (unsolvedGroups: {category: string, words: string[], level: number}[]): Promise<string> => {
    try {
        const { hint } = await callApi<{ hint: string }>('/api/getCategoryHint', { unsolvedGroups });
        return hint;
    } catch (e) {
        console.error("Error getting category hint from API:", e);
        if (e instanceof Error) throw e;
        throw new Error("Could not get a category hint at this time.");
    }
};

export async function callGemini(prompt: string) {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error("Failed to call Gemini API");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    return { error: "Something went wrong" };
  }
}

