
import React, { useState } from 'react';
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

const FarcasterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block mr-2">
        <path d="M13.203 7.32H8.86C8.013 7.32 7.32 8.013 7.32 8.86V15.14C7.32 15.987 8.013 16.68 8.86 16.68H10.852V13.832H8.86V12.2H10.852V10.4H12.492V12.2H14.484L14.708 13.832H12.492V16.68H15.14C15.987 16.68 16.68 15.987 16.68 15.14V11.2C16.68 9.04 15.14 7.32 13.203 7.32Z" fill="white"/>
    </svg>
);


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
  const [copyButtonText, setCopyButtonText] = useState('Copy Results');
  
  const generateShareText = () => {
    const mistakesText = `${mistakesMade} mistake${mistakesMade !== 1 ? 's' : ''}`;
    let resultText = `I ${isWin ? 'won' : 'lost'} today's Farnect`;
    if (isWin) {
      resultText += ` in ${formatTime(timeTaken)} with ${mistakesText}`;
    }
    if (hintsUsed > 0) {
        resultText += ` and ${hintsUsed} hint${hintsUsed > 1 ? 's' : ''}`;
    }
    resultText += '! 🟣🔵🟢🟡';
    return resultText;
  }

  const handleShare = () => {
    const resultText = generateShareText();
    const appUrl = window.location.href;
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(resultText)}&embeds[]=${encodeURIComponent(appUrl)}`;
    window.open(shareUrl, '_blank');
  };

  const handleCopy = () => {
    const resultText = generateShareText();
    navigator.clipboard.writeText(resultText).then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy Results'), 2000);
    }).catch(err => {
        console.error('Failed to copy results:', err);
        alert('Could not copy results to clipboard.');
    });
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
                <button
                    onClick={handleCopy}
                    className="w-full py-3 rounded-full border-2 border-gray-500 text-gray-200 font-bold hover:bg-gray-700 transition-colors"
                >
                    {copyButtonText}
                </button>
                <button
                    onClick={handleShare}
                    className="w-full py-3 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                    <FarcasterIcon />
                    Share
                </button>
            </div>
        ) : (
            <div className="flex flex-col gap-3">
                 <button
                    onClick={onPlayAgain}
                    className="w-full py-3 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
                    >
                    Practice Again
                </button>
                <button
                    onClick={onGoHome}
                    className="w-full py-3 rounded-full border-2 border-gray-500 text-gray-200 font-bold hover:bg-gray-700 transition-colors"
                    >
                    Go Home
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResultModal;