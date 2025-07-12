

import React from 'react';

interface ControlsProps {
  onShuffle: () => void;
  onDeselect: () => void;
  onSubmit: () => void;
  onShowHintOptions: () => void;
  canSubmit: boolean;
  isGettingHint: boolean;
  totalHints: number;
}

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean }> = ({ onClick, children, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-6 py-2 rounded-full font-semibold border-2 border-gray-400 text-gray-300 hover:bg-gray-600 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {children}
  </button>
);

const Controls: React.FC<ControlsProps> = ({ onShuffle, onDeselect, onSubmit, onShowHintOptions, canSubmit, isGettingHint, totalHints }) => {
  return (
    <div className="flex justify-center items-center gap-2 sm:gap-4 my-4">
      <Button onClick={onShuffle}>Shuffle</Button>
      <Button onClick={onDeselect}>Deselect</Button>
      <Button onClick={onShowHintOptions} disabled={isGettingHint}>
        💡 Hints ({totalHints})
      </Button>
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="px-6 py-2 rounded-full font-semibold bg-gray-200 text-gray-900 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Submit
      </button>
    </div>
  );
};

export default Controls;