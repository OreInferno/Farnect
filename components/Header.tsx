import React from 'react';

interface HeaderProps {
  mistakes?: number;
  time?: number; // in seconds
  title: string;
  subtitle?: string;
  streak?: number;
  onHomeClick?: () => void;
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

const FlameIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-orange-500">
        <path d="M10.88,2.1a1,1,0,0,0-1.76,0L6,6.43A5.45,5.45,0,0,0,6,13.6,5.19,5.19,0,0,0,10,16.26,5.19,5.19,0,0,0,14,13.6a5.45,5.45,0,0,0,0-7.17Z" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ mistakes, time, title, subtitle, streak, onHomeClick }) => {
  return (
    <header className="text-center py-4 px-4 relative">
        {onHomeClick && (
            <button onClick={onHomeClick} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
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

      {streak !== undefined && streak > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-full">
              <FlameIcon />
              <span className="font-bold text-white">{streak}</span>
          </div>
      )}
    </header>
  );
};
