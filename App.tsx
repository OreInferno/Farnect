import React, { useState, useEffect, useCallback } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi-config.ts';
import LandingPage from './components/Landing.tsx';
import { GameContainer } from './components/GameContainer.tsx';
import Leaderboard from './components/Leaderboard.tsx';
import HowToPlayModal from './components/HowToPlayModal.tsx';
import './index.css';

const queryClient = new QueryClient();

// In a real app, user data would come from an auth solution like Privy or Neynar.
const MOCK_USER = { fid: 194, username: 'woj.eth' };

type AppView = 'landing' | 'daily' | 'practice' | 'leaderboard';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const AppContent: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<{ fid: number; username: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const [practiceKey, setPracticeKey] = useState(1);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    // Check if it's the user's first time visiting
    try {
        const hasVisited = localStorage.getItem('farnect_hasVisited');
        if (!hasVisited) {
            setShowHowToPlay(true);
            localStorage.setItem('farnect_hasVisited', 'true');
        }
    } catch(e) { console.error("Could not access localStorage for first visit check", e); }
    
    setUser(MOCK_USER);

    try {
      const lastWinDate = localStorage.getItem('farnect_lastWinDate');
      const storedStreak = parseInt(localStorage.getItem('farnect_streak') || '0', 10);
      
      if (lastWinDate) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        
        const lastWin = new Date(lastWinDate + 'T00:00:00');

        if (lastWin.toDateString() !== yesterday.toDateString() && lastWin.toDateString() !== today.toDateString()) {
          setStreak(0);
          localStorage.setItem('farnect_streak', '0');
        } else {
          setStreak(storedStreak);
        }
      }
    } catch (e) {
      console.error("Could not process streak from localStorage", e);
      setStreak(0);
    }
  }, []);

  const handleDailyWin = useCallback(() => {
    const today = getTodayDateString();
    const lastWinDate = localStorage.getItem('farnect_lastWinDate');

    if (lastWinDate !== today) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setShowStreakAnimation(true);
        localStorage.setItem('farnect_streak', newStreak.toString());
        localStorage.setItem('farnect_lastWinDate', today);
        setTimeout(() => setShowStreakAnimation(false), 2000);
    }
  }, [streak]);
  
  const handleGoHome = () => setView('landing');
  const handleToggleHowToPlay = () => setShowHowToPlay(s => !s);

  const handlePracticeAgain = () => {
      setPracticeKey(key => key + 1);
      setView('practice');
  };

  const handlePlayPractice = () => {
      setPracticeKey(key => key + 1);
      setView('practice');
  };

  const renderView = () => {
    switch (view) {
      case 'daily':
        return <GameContainer 
                    key="daily"
                    mode="daily" 
                    user={user} 
                    onGoHome={handleGoHome} 
                    onDailyWin={handleDailyWin}
                    onPracticeAgain={handlePracticeAgain} // Prop not used in daily mode but required
                    onViewLeaderboard={() => setView('leaderboard')}
                    onHowToPlay={handleToggleHowToPlay}
                />;
      case 'practice':
        return <GameContainer 
                    key={practiceKey}
                    mode="practice" 
                    user={user}
                    onGoHome={handleGoHome}
                    onDailyWin={() => {}} // No streak for practice
                    onPracticeAgain={handlePracticeAgain}
                    onViewLeaderboard={() => {}} // No leaderboard from practice result
                    onHowToPlay={handleToggleHowToPlay}
                />;
      case 'leaderboard':
        return <Leaderboard onGoHome={handleGoHome} onHowToPlay={handleToggleHowToPlay} />;
      case 'landing':
      default:
        return <LandingPage 
                    onPlayDaily={() => setView('daily')}
                    onPlayPractice={handlePlayPractice}
                    onViewLeaderboard={() => setView('leaderboard')}
                    onSignIn={() => setUser(MOCK_USER)}
                    streak={streak}
                    showStreakAnimation={showStreakAnimation}
                    onHowToPlay={handleToggleHowToPlay}
                />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      {showHowToPlay && <HowToPlayModal onClose={handleToggleHowToPlay} />}
      {renderView()}
    </div>
  );
};


const App: React.FC = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;