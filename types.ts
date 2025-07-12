
export interface PuzzleData {
  category: string;
  words: string[];
}

export interface GameWord {
  text: string;
  group: number;
}

export interface GuessedGroup {
  category: string;
  words: string[];
  level: number;
}

export enum GameState {
  LOADING,
  PLAYING,
  WON,
  LOST,
  ERROR,
  ALREADY_PLAYED,
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    time: string;
    mistakes: number;
}

export interface ScoreSubmission {
    date: string;
    fid: number;
    username: string;
    time: number; // in seconds
    mistakes: number;
}

export interface WordHint {
    text: string;
    level: number;
}

export interface StoredGameState {
    mistakes: number;
    guessedGroups: GuessedGroup[];
    words: GameWord[];
    solution: PuzzleData[];
    gameState: GameState;
    startTime: number;
    endTime?: number;
    hintWords?: WordHint[];
    hintCategories?: string[];
    availableWordHints?: number;
    availableCategoryHints?: number;
}
