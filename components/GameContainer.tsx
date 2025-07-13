import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, PuzzleData, GameWord, GuessedGroup, StoredGameState, WordHint } from '../types.ts';
import { GROUP_HINT_TEXT_COLORS, MAX_MISTAKES, HINT_BUNDLE_WORD_COUNT, HINT_BUNDLE_CATEGORY_COUNT } from '../constants.ts';
import { generateNewPuzzle, getWordHint, getCategoryHint } from '../services/geminiService.ts';
import { submitScore } from '../services/leaderboardService.ts';
import { Header } from './Header.tsx';
import GuessedGroupRow from './GuessedGroupRow.tsx';
import WordGrid from './WordGrid.tsx';
import Controls from './Controls.tsx';
import ResultModal from './ResultModal.tsx';
import GetHintsModal from './HintPurchaseModal.tsx';
import { LoadingSpinner, ErrorDisplay } from './common.tsx';

type GameMode = 'daily' | 'practice';

interface GameContainerProps {
    mode: GameMode;
    user: { fid: number; username: string } | null;
    onGoHome: () => void;
    onDailyWin: () => void;
    onPracticeAgain: () => void;
    onViewLeaderboard: () => void;
    onHowToPlay: () => void;
}

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);
const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const GameContainer: React.FC<GameContainerProps> = ({ mode, user, onGoHome, onDailyWin, onPracticeAgain, onViewLeaderboard, onHowToPlay }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [words, setWords] = useState<GameWord[]>([]);
  const [solution, setSolution] = useState<PuzzleData[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [guessedGroups, setGuessedGroups] = useState<GuessedGroup[]>([]);
  const [mistakes, setMistakes] = useState<number>(MAX_MISTAKES);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [time, setTime] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number | undefined>();
  
  // Hint System State
  const [hintWords, setHintWords] = useState<WordHint[]>([]);
  const [hintCategories, setHintCategories] = useState<string[]>([]);
  const [availableWordHints, setAvailableWordHints] = useState(0);
  const [availableCategoryHints, setAvailableCategoryHints] = useState(0);
  const [isGettingHint, setIsGettingHint] = useState<boolean>(false);
  const [showGetHintsModal, setShowGetHintsModal] = useState(false);

  const guessedWordsSet = useMemo(() => new Set(guessedGroups.flatMap(g => g.words)), [guessedGroups]);
  const gameId = useMemo(() => (mode === 'daily' ? getTodayDateString() : Date.now().toString()), [mode]);

  const saveStateToStorage = useCallback((stateToSave: Partial<StoredGameState>) => {
    if (mode !== 'daily') return;
    try {
        const currentState = JSON.parse(localStorage.getItem(`farnect-${gameId}`) || '{}');
        const newState = { ...currentState, ...stateToSave };
        localStorage.setItem(`farnect-${gameId}`, JSON.stringify(newState));
    } catch (e) { console.error("Could not save state", e); }
  }, [mode, gameId]);
  
  const handleGameEnd = useCallback((endState: GameState.WON | GameState.LOST, finalMistakes: number) => {
    const finalEndTime = Date.now();
    setEndTime(finalEndTime);
    setGameState(endState);
    
    if (mode === 'daily') {
        const timeTaken = Math.floor((finalEndTime - startTime) / 1000);
        saveStateToStorage({ gameState: endState, endTime: finalEndTime, mistakes: finalMistakes });
        if (endState === GameState.WON) {
            onDailyWin();
            if (user) {
                submitScore({
                    date: gameId,
                    fid: user.fid,
                    username: user.username,
                    time: timeTaken,
                    mistakes: MAX_MISTAKES - finalMistakes,
                });
            }
        }
    }
  }, [mode, user, gameId, startTime, saveStateToStorage, onDailyWin]);

  const loadGame = useCallback(async () => {
    setGameState(GameState.LOADING);
    setErrorMessage(undefined);
    setGuessedGroups([]);
    setSelectedWords([]);
    setMistakes(MAX_MISTAKES);
    setTime(0);
    setEndTime(undefined);
    setHintWords([]);
    setHintCategories([]);
    setAvailableWordHints(0);
    setAvailableCategoryHints(0);
    setIsGettingHint(false);

    if(mode === 'daily') {
        const storedStateRaw = localStorage.getItem(`farnect-${gameId}`);
        if(storedStateRaw) {
            try {
                const storedState: StoredGameState = JSON.parse(storedStateRaw);
                 if (storedState.gameState === GameState.WON || storedState.gameState === GameState.LOST) {
                    setGameState(storedState.gameState);
                    setSolution(storedState.solution);
                    setMistakes(storedState.mistakes);
                    setGuessedGroups(storedState.guessedGroups);
                    setStartTime(storedState.startTime);
                    setEndTime(storedState.endTime);
                    setHintWords(storedState.hintWords || []);
                    setHintCategories(storedState.hintCategories || []);
                    setAvailableWordHints(storedState.availableWordHints || 0);
                    setAvailableCategoryHints(storedState.availableCategoryHints || 0);
                    return;
                } else if (storedState.words?.length > 0) {
                    setSolution(storedState.solution);
                    setWords(storedState.words);
                    setGuessedGroups(storedState.guessedGroups || []);
                    setMistakes(storedState.mistakes);
                    setStartTime(storedState.startTime || Date.now());
                    setHintWords(storedState.hintWords || []);
                    setHintCategories(storedState.hintCategories || []);
                    setAvailableWordHints(storedState.availableWordHints || 0);
                    setAvailableCategoryHints(storedState.availableCategoryHints || 0);
                    setGameState(GameState.PLAYING);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse stored game state, starting fresh.", e);
                localStorage.removeItem(`farnect-${gameId}`);
            }
        }
    }
    
    try {
      const puzzleData = await generateNewPuzzle(gameId);
      const gameWords: GameWord[] = puzzleData.flatMap((group, index) => 
        group.words.map(word => ({ text: word, group: index }))
      );
      const newStartTime = Date.now();

      setSolution(puzzleData);
      setWords(shuffleArray(gameWords));
      setStartTime(newStartTime);
      setGameState(GameState.PLAYING);
      
      if (mode === 'daily') {
          saveStateToStorage({
              solution: puzzleData,
              words: gameWords,
              mistakes: MAX_MISTAKES,
              guessedGroups: [],
              startTime: newStartTime,
              gameState: GameState.PLAYING,
              hintWords: [],
              hintCategories: [],
              availableWordHints: 0,
              availableCategoryHints: 0,
          });
      }
    } catch (error) {
      console.error(error);
      setErrorMessage((error as Error).message);
      setGameState(GameState.ERROR);
    }
  }, [mode, gameId, saveStateToStorage]);

  useEffect(() => { loadGame(); }, [loadGame]);
  
  useEffect(() => {
    let interval: number | undefined;
    if (gameState === GameState.PLAYING && mode === 'daily') {
        interval = window.setInterval(() => {
            if (startTime > 0) {
                setTime(Math.floor((Date.now() - startTime) / 1000));
            }
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, startTime, mode]);

  const handleWordClick = useCallback((word: string) => {
    if (gameState !== GameState.PLAYING || guessedWordsSet.has(word)) return;
    setSelectedWords(prev => {
      if (prev.includes(word)) return prev.filter(w => w !== word);
      if (prev.length < 4) return [...prev, word];
      return prev;
    });
  }, [gameState, guessedWordsSet]);

  const handleGetHint = useCallback(async () => {
    if (isGettingHint) return;
    
    const hasWordHint = availableWordHints > 0;
    const hasCategoryHint = availableCategoryHints > 0;

    if (!hasWordHint && !hasCategoryHint) {
        setShowGetHintsModal(true);
        return;
    }

    const unsolvedGroups = solution
        .map((s, i) => ({...s, level: i}))
        .filter((_, i) => !guessedGroups.some(g => g.level === i));

    if (unsolvedGroups.length <= 1) return; // Don't give hints for the last group

    setIsGettingHint(true);
    try {
        if (hasWordHint) {
            const hint = await getWordHint(unsolvedGroups);
            const newHintWords = [...hintWords, hint];
            const newAvailableHints = availableWordHints - 1;
            setHintWords(newHintWords);
            setAvailableWordHints(newAvailableHints);
            saveStateToStorage({ hintWords: newHintWords, availableWordHints: newAvailableHints });
        } else if (hasCategoryHint) {
            const hint = await getCategoryHint(unsolvedGroups);
            const newHintCategories = [...hintCategories, hint];
            const newAvailableHints = availableCategoryHints - 1;
            setHintCategories(newHintCategories);
            setAvailableCategoryHints(newAvailableHints);
            saveStateToStorage({ hintCategories: newHintCategories, availableCategoryHints: newAvailableHints });
        }
    } catch(e) { alert((e as Error).message); }
    finally { setIsGettingHint(false); }

  }, [isGettingHint, solution, hintWords, hintCategories, availableWordHints, availableCategoryHints, guessedGroups, saveStateToStorage]);

  const handlePurchaseSuccess = useCallback(() => {
    const newAvailableWordHints = availableWordHints + HINT_BUNDLE_WORD_COUNT;
    const newAvailableCategoryHints = availableCategoryHints + HINT_BUNDLE_CATEGORY_COUNT;
    setAvailableWordHints(newAvailableWordHints);
    setAvailableCategoryHints(newAvailableCategoryHints);
    saveStateToStorage({ availableWordHints: newAvailableWordHints, availableCategoryHints: newAvailableCategoryHints });
    setShowGetHintsModal(false);
  }, [availableWordHints, availableCategoryHints, saveStateToStorage]);

  const handleSubmit = useCallback(() => {
    if (selectedWords.length !== 4) return;

    const wordToGroupMap = new Map(solution.flatMap((p, i) => p.words.map(w => [w.toUpperCase(), i])));
    const groupIndex = wordToGroupMap.get(selectedWords[0].toUpperCase());
    const isCorrect = selectedWords.every(word => wordToGroupMap.get(word.toUpperCase()) === groupIndex);

    if (isCorrect && groupIndex !== undefined) {
      const newGuessedGroup: GuessedGroup = {
        category: solution[groupIndex].category,
        words: solution[groupIndex].words,
        level: groupIndex,
      };
      
      const updatedGuessedGroups = [...guessedGroups, newGuessedGroup].sort((a,b) => a.level - b.level);
      setGuessedGroups(updatedGuessedGroups);
      setSelectedWords([]);
      saveStateToStorage({ guessedGroups: updatedGuessedGroups });

      if (updatedGuessedGroups.length === 4) {
        handleGameEnd(GameState.WON, mistakes);
      }
    } else {
      const newMistakes = mistakes - 1;
      setMistakes(newMistakes);
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setSelectedWords([]);
      }, 500);

      saveStateToStorage({ mistakes: newMistakes });

      if (newMistakes === 0) {
        handleGameEnd(GameState.LOST, 0);
      }
    }
  }, [selectedWords, solution, guessedGroups, mistakes, saveStateToStorage, handleGameEnd]);

  const handleShuffle = useCallback(() => setWords(prev => shuffleArray(prev)), []);

  const renderContent = () => {
    switch (gameState) {
      case GameState.LOADING:
        return <LoadingSpinner text={mode === 'daily' ? "Loading today's puzzle..." : "Generating new puzzle..."} />;
      case GameState.ERROR:
        return <ErrorDisplay onRetry={loadGame} message={errorMessage} />;
      case GameState.PLAYING:
      case GameState.WON:
      case GameState.LOST:
        const finalSolutionForModal = solution.map((s, i) => ({ ...s, level: i }));
        const timeTakenOnEnd = endTime && startTime ? Math.floor((endTime - startTime) / 1000) : time;
        const totalHintsUsed = hintWords.length + hintCategories.length;

        return (
          <>
            {showGetHintsModal && (
                <GetHintsModal 
                    onPurchaseSuccess={handlePurchaseSuccess}
                    onCancel={() => setShowGetHintsModal(false)}
                />
            )}
            <div className="p-4 space-y-2">
              {guessedGroups.map(group => (<GuessedGroupRow key={group.level} group={group} />))}
            </div>
            
            {gameState === GameState.PLAYING ? (
              <>
                <WordGrid words={words} selectedWords={selectedWords} guessedWords={guessedWordsSet} onWordClick={handleWordClick} isShaking={isShaking} />
                {(hintWords.length > 0 || hintCategories.length > 0) && (
                     <div className="text-center text-gray-400 p-2 space-y-1 max-w-lg mx-auto">
                        {hintWords.length > 0 && (
                            <div>
                                <span className="font-semibold text-gray-300">Revealed Words:</span>{' '}
                                {hintWords.map((hint, i) => (
                                    <span key={i} className={`font-bold uppercase ${GROUP_HINT_TEXT_COLORS[hint.level]}`}>
                                        {hint.text}{i < hintWords.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </div>
                        )}
                         {hintCategories.length > 0 && (
                            <div>
                                <span className="font-semibold text-gray-300">Revealed Categories:</span>{' '}
                                {hintCategories.map((hint, i) => (
                                    <span key={i} className="font-bold uppercase text-gray-400">
                                        "{hint}"{i < hintCategories.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <Controls 
                    onShuffle={handleShuffle} 
                    onDeselect={() => setSelectedWords([])} 
                    onSubmit={handleSubmit} 
                    onGetHint={handleGetHint}
                    canSubmit={selectedWords.length === 4}
                    isGettingHint={isGettingHint}
                    hintsLeft={availableWordHints + availableCategoryHints}
                />
              </>
            ) : (
               <ResultModal 
                    gameState={gameState} 
                    solution={finalSolutionForModal} 
                    mistakesMade={MAX_MISTAKES - mistakes}
                    timeTaken={timeTakenOnEnd}
                    hintsUsed={totalHintsUsed}
                    mode={mode}
                    onGoHome={onGoHome}
                    onViewLeaderboard={onViewLeaderboard}
                    onPlayAgain={onPracticeAgain}
                />
            )}
          </>
        );
      default: return null;
    }
  };
  
  const headerTitle = mode === 'daily' ? 'Farnect' : 'Practice Arena';
  const headerSubtitle = mode === 'daily' ? new Date(gameId + 'T00:00:00').toLocaleDateString('en-us', {month: 'long', day: 'numeric', year: 'numeric'}) : "Unlimited random puzzles";

  return (
    <>
        <Header 
            title={headerTitle} 
            subtitle={headerSubtitle}
            mistakes={mode === 'daily' ? mistakes : undefined}
            time={mode === 'daily' ? time : undefined}
            onHomeClick={onGoHome}
            onHowToPlayClick={onHowToPlay}
        />
        <main className="flex-grow flex flex-col justify-start">
            {renderContent()}
        </main>
        <footer className="text-center text-xs text-gray-600 p-4">
            Farnect by FrameDev. Inspired by The New York Times.
        </footer>
    </>
  );
};