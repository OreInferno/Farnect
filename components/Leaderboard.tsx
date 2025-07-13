import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types.ts';
import { getLeaderboard } from '../services/leaderboardService.ts';
import { LoadingSpinner } from './common.tsx';
import { Header } from './Header.tsx';

interface LeaderboardProps {
    onGoHome: () => void;
    onHowToPlay: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onGoHome, onHowToPlay }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const today = new Date().toISOString().split('T')[0];
        const data = await getLeaderboard(today);
        setEntries(data);
      } catch (e) {
        setError("Could not load leaderboard data.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);
  
  if (error) {
    return (
        <>
            <Header title="Leaderboard" onHomeClick={onGoHome} onHowToPlayClick={onHowToPlay} />
            <p className="text-center text-red-400 p-8">{error}</p>
        </>
    );
  }

  return (
    <>
      <Header title="Leaderboard" subtitle="Today's Top Scores" onHomeClick={onGoHome} onHowToPlayClick={onHowToPlay} />
      <div className="p-4 md:p-6 text-white">
        <div className="bg-gray-800 rounded-lg shadow-md">
            {isLoading ? (
                <LoadingSpinner text="Loading Leaderboard..." />
            ) : (
                <>
                <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-700 font-semibold text-gray-400 text-sm">
                    <div className="col-span-2">Rank</div>
                    <div className="col-span-5">Name</div>
                    <div className="col-span-3 text-right">Time</div>
                    <div className="col-span-2 text-right">Mistakes</div>
                </div>
                {entries.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No scores yet today. Be the first!</p>
                ) : (
                <ul className="divide-y divide-gray-700">
                    {entries.map((entry) => (
                    <li key={entry.rank} className="grid grid-cols-12 gap-4 px-4 py-3 items-center">
                        <div className="col-span-2 font-bold text-lg">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                        </div>
                        <div className="col-span-5 font-semibold truncate">{entry.name}</div>
                        <div className="col-span-3 text-right font-mono">{entry.time}</div>
                        <div className="col-span-2 text-right font-mono">{entry.mistakes}</div>
                    </li>
                    ))}
                </ul>
                )}
                </>
            )}
        </div>
      </div>
    </>
  );
};

export default Leaderboard;