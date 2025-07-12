import React from 'react';
import { GameWord } from '../types.ts';

interface WordGridProps {
  words: GameWord[];
  selectedWords: string[];
  guessedWords: Set<string>;
  onWordClick: (word: string) => void;
  isShaking: boolean;
}

const WordTile: React.FC<{
  word: GameWord;
  isSelected: boolean;
  isGuessed: boolean;
  isShaking: boolean;
  onClick: (word: string) => void;
}> = ({ word, isSelected, isGuessed, isShaking, onClick }) => {
  if (isGuessed) {
    return null; // Don't render guessed words in the grid
  }

  const baseClasses = 'h-full flex items-center justify-center p-2 rounded-md font-bold uppercase cursor-pointer transition-all duration-200 ease-in-out transform';
  
  const tileClasses = isSelected
    ? 'bg-gray-400 text-gray-900 scale-105'
    : 'bg-gray-700 hover:bg-gray-600';
  
  const shakeClass = isShaking && isSelected ? 'shake' : '';

  return (
    <div
      className={`${baseClasses} ${tileClasses} ${shakeClass}`}
      onClick={() => onClick(word.text)}
    >
      {word.text}
    </div>
  );
};

const WordGrid: React.FC<WordGridProps> = ({ words, selectedWords, guessedWords, onWordClick, isShaking }) => {
  return (
    <div className="grid grid-cols-4 grid-rows-4 gap-2.5 p-4 text-sm md:text-base aspect-square max-w-lg mx-auto">
      {words.map((word) => (
        <WordTile
          key={word.text}
          word={word}
          isSelected={selectedWords.includes(word.text)}
          isGuessed={guessedWords.has(word.text)}
          isShaking={isShaking}
          onClick={onWordClick}
        />
      ))}
    </div>
  );
};

export default WordGrid;