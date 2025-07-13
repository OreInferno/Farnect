import React from 'react';

interface HeaderProps {
  mistakes?: number;
  time?: number; // in seconds
  title: string;
  subtitle?: string;
  onHomeClick?: () => void;
  onHowToPlayClick?: () => void;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const HelpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ mistakes, time, title, subtitle, onHomeClick, onHowToPlayClick }) => {
  return (
    <header className="text-center py-4 px-4 relative">
        {onHomeClick && (
            <button onClick={onHomeClick} className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 hover:text-white transition-colors" aria-label="Go Home">
                <HomeIcon />
            </button>
        )}
       <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
      
      {mistakes !== undefined && time !== undefined && (
        <div className="flex items-center justify-between gap-2 mt-4 max-w-xs mx-auto">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-300">Mistakes:</span>
                <div className="flex gap-1.5">
                {Array(mistakes).fill(0).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-gray-400 rounded-full"></div>
                ))}
                </div>
            </div>
            <div className="font-mono text-lg font-semibold text-gray-300">
                {formatTime(time)}
            </div>
        </div>
      )}

      {onHowToPlayClick && (
         <button onClick={onHowToPlayClick} className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-white transition-colors" aria-label="How to Play">
             <HelpIcon />
         </button>
      )}
    </header>
  );
};