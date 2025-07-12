import React from 'react';
import { GameState, GuessedGroup } from '../types.ts';
import { GROUP_COLORS, MAX_MISTAKES } from '../constants.ts';

type GameMode = 'daily' | 'practice';

interface ResultModalProps {
  gameState: GameState.WON | GameState.LOST;
  solution: GuessedGroup[];
  mistakesMade: number;
  timeTaken: number; // in seconds
  hintsUsed: number;
  mode: GameMode;
  onPlayAgain?: () => void; // For practice mode
  onGoHome: () => void;
  onViewLeaderboard?: () => void; // For daily mode
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
};

const ResultModal: React.FC<ResultModalProps> = ({ 
    gameState, 
    solution, 
    mistakesMade, 
    timeTaken, 
    hintsUsed,
    mode, 
    onPlayAgain, 
    onGoHome, 
    onViewLeaderboard 
}) => {
  const isWin = gameState === GameState.WON;
  const title = isWin ? "Congratulations!" : (mode === 'daily' ? "Next Time!" : "Good Try!");
  
  const handleShare = () => {
    const mistakesText = `${mistakesMade} mistake${mistakesMade !== 1 ? 's' : ''}`;
    let resultText = `I won today's Farnect in ${formatTime(timeTaken)} with ${mistakesText}`;
    if (hintsUsed > 0) {
        resultText += ` and ${hintsUsed} hint${hintsUsed > 1 ? 's' : ''}`;
    }
    resultText += '! 🟣🔵🟢🟡';
    const appUrl = window.location.href;
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(resultText)}&embeds[]=${encodeURIComponent(appUrl)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-lg relative">
        <button onClick={onGoHome} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        {mode === 'daily' && (
            <div className="flex justify-center gap-4 my-4 text-gray-300">
                <div>
                    <p className="text-2xl font-bold">{formatTime(timeTaken)}</p>
                    <p className="text-sm text-gray-400">Time</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold">{mistakesMade}</p>
                    <p className="text-sm text-gray-400">Mistakes</p>
                </div>
                {hintsUsed > 0 && (
                     <div>
                        <p className="text-2xl font-bold">{hintsUsed}</p>
                        <p className="text-sm text-gray-400">Hints</p>
                    </div>
                )}
            </div>
        )}
        <p className="text-gray-400 mb-6">The final connections were:</p>
        <div className="space-y-2 mb-8">
          {solution.map((group) => (
            <div key={group.level} className={`p-3 rounded-lg ${GROUP_COLORS[group.level]}`}>
              <p className="font-bold uppercase text-base">{group.category}</p>
              <p className="font-semibold uppercase text-sm">{group.words.join(', ')}</p>
            </div>
          ))}
        </div>

        {mode === 'daily' ? (
             <div className="flex flex-col sm:flex-row gap-3">
                 <button
                    onClick={onViewLeaderboard}
                    className="w-full py-3 rounded-full bg-gray-600 text-white font-bold hover:bg-gray-700 transition-colors"
                    >
                    View Leaderboard
                </button>
                {isWin && (
                    <button
                        onClick={handleShare}
                        className="w-full py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
                        >
                        Share on Farcaster
                    </button>
                )}
            </div>
        ) : (
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={onGoHome}
                    className="w-full py-3 rounded-full bg-gray-600 text-white font-bold hover:bg-gray-700 transition-colors"
                    >
                    Go Home
                </button>
                <button
                    onClick={onPlayAgain}
                    className="w-full py-3 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
                    >
                    Practice Again
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResultModal;