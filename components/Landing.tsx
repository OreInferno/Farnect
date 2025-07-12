import React, { useRef, useEffect } from 'react';

interface LandingPageProps {
  onPlayDaily: () => void;
  onPlayPractice: () => void;
  onViewLeaderboard: () => void;
  onSignIn: () => void;
  streak: number;
  showStreakAnimation: boolean;
}

const FlameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-orange-400">
        <path d="M10.88,2.1a1,1,0,0,0-1.76,0L6,6.43A5.45,5.45,0,0,0,6,13.6,5.19,5.19,0,0,0,10,16.26,5.19,5.19,0,0,0,14,13.6a5.45,5.45,0,0,0,0-7.17Z" />
    </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ onPlayDaily, onPlayPractice, onViewLeaderboard, onSignIn, streak, showStreakAnimation }) => {
  const streakRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (showStreakAnimation && streakRef.current) {
      const element = streakRef.current;
      element.classList.add('streak-fire-up');
      const handleAnimationEnd = () => {
        element.classList.remove('streak-fire-up');
        element.removeEventListener('animationend', handleAnimationEnd);
      };
      element.addEventListener('animationend', handleAnimationEnd);
    }
  }, [showStreakAnimation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <div className="max-w-md w-full">
        {streak > 0 && (
          <div ref={streakRef} className="flex items-center justify-center gap-2 mb-6">
            <FlameIcon />
            <span className="text-3xl font-extrabold text-orange-400">
                {streak} Day Streak!
            </span>
          </div>
        )}
        <h1 className="text-6xl font-bold tracking-tighter text-white">Farnect</h1>
        <p className="text-gray-400 mt-2 mb-10">A 'Connections' style game for Farcaster.</p>
        
        <div className="space-y-4">
           <button
            onClick={onPlayDaily}
            className="w-full py-4 rounded-lg bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
          >
            Play Daily Puzzle
          </button>
           <button
            onClick={onPlayPractice}
            className="w-full py-3 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors"
          >
            Practice Arena
          </button>
          <button
            onClick={onViewLeaderboard}
            className="w-full py-3 rounded-lg border-2 border-gray-600 text-gray-300 font-semibold hover:bg-gray-700 transition-colors"
          >
            View Leaderboard
          </button>
        </div>

        <footer className="text-xs text-gray-600 mt-12">
            Inspired by The New York Times Connections.
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;