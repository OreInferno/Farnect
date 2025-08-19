import React, { useState, useEffect, useCallback } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi-config';
import LandingPage from './components/Landing';
import { GameContainer } from './components/GameContainer';
import Leaderboard from './components/Leaderboard';
import HowToPlayModal from './components/HowToPlayModal';
import '@/index.css';

// ✅ Added Gemini service import
import { callGemini } from './services/geminiService';

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

  // ✅ Added Gemini test output (optional debug)
  const [geminiOutput, setGeminiOutput] = useState("");

  useEffect(() => {
    try {
      const hasVisited = localStorage.getItem('farnect_hasVisited');
      if (!hasVisited) {
        setShowHowToPlay(true);
        localStorage.setItem('farnect_hasVisited', 'true');
      }
    } catch(e) { console.error("Could not access localStorage", e); }

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
  const handlePracticeAgain = () => { setPracticeKey(k => k + 1); setView('practice'); };
  const handlePlayPractice = () => { setPracticeKey(k => k + 1); setView('practice'); };

  // ✅ Function to test Gemini
  async function handleGeminiTest() {
    try {
      const data = await callGemini("Hello Gemini securely!");
      setGeminiOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setGeminiOutput(err.message);
    }
  }

  const renderView = () => {
    switch (view) {
      case 'daily':
        return <GameContainer key="daily" mode="daily" user={user} onGoHome={handleGoHome} onDailyWin={handleDailyWin}
                              onPracticeAgain={handlePracticeAgain} onViewLeaderboard={() => setView('leaderboard')}
                              onHowToPlay={handleToggleHowToPlay} />;
      case 'practice':
        return <GameContainer key={practiceKey} mode="practice" user={user} onGoHome={handleGoHome}
                              onDailyWin={() => {}} onPracticeAgain={handlePracticeAgain}
                              onViewLeaderboard={() => {}} onHowToPlay={handleToggleHowToPlay} />;
      case 'leaderboard':
        return <Leaderboard onGoHome={handleGoHome} onHowToPlay={handleToggleHowToPlay} />;
      case 'landing':
      default:
        return <LandingPage onPlayDaily={() => setView('daily')} onPlayPractice={handlePlayPractice}
                            onViewLeaderboard={() => setView('leaderboard')} onSignIn={() => setUser(MOCK_USER)}
                            streak={streak} showStreakAnimation={showStreakAnimation}
                            onHowToPlay={handleToggleHowToPlay} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      {showHowToPlay && <HowToPlayModal onClose={handleToggleHowToPlay} />}
      {renderView()}

      {/* ✅ Debug Gemini test UI */}
      <div className="p-4 bg-gray-800 mt-4">
        <button onClick={handleGeminiTest} className="rounded bg-blue-600 px-3 py-2">
          Test Gemini
        </button>
        {geminiOutput && (
          <pre className="mt-2 bg-gray-700 p-2 rounded">{geminiOutput}</pre>
        )}
      </div>
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
