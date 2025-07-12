
import React from 'react';

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <svg className="animate-spin h-10 w-10 mb-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="font-semibold">{text || 'Loading...'}</p>
    </div>
);

export const ErrorDisplay: React.FC<{ onRetry: () => void; message?: string }> = ({ onRetry, message }) => (
    <div className="flex flex-col items-center justify-center h-64 text-center text-red-400 p-4">
      <p className="font-bold text-xl">Oops! Something went wrong.</p>
      <p className="text-gray-400 mb-6">{message || "Could not complete the request."}</p>
      <button onClick={onRetry} className="px-6 py-2 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors">
        Try Again
      </button>
    </div>
);
