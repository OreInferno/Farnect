import React from 'react';

interface ControlsProps {
  onShuffle: () => void;
  onDeselect: () => void;
  onSubmit: () => void;
  onGetHint: () => void;
  canSubmit: boolean;
  isGettingHint: boolean;
  hintsLeft: number;
}

const Button: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean; className?: string }> = ({ onClick, children, disabled = false, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-full font-semibold border-2 border-gray-400 text-gray-300 hover:bg-gray-600 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
  >
    {children}
  </button>
);

const Controls: React.FC<ControlsProps> = ({ onShuffle, onDeselect, onSubmit, onGetHint, canSubmit, isGettingHint, hintsLeft }) => {
  return (
    <div className="flex flex-col items-center gap-3 my-4">
        <div className="flex justify-center items-center gap-2 sm:gap-3">
            <Button onClick={onShuffle}>Shuffle</Button>
            <Button onClick={onDeselect}>Deselect</Button>
            <Button onClick={onGetHint} disabled={isGettingHint} className="!border-yellow-400/50 hover:!border-yellow-400">
                Hint ({hintsLeft})
            </Button>
        </div>
         <div className="flex justify-center items-center gap-2 sm:gap-3">
            <button
                onClick={onSubmit}
                disabled={!canSubmit}
                className="px-8 py-3 rounded-full font-semibold bg-gray-200 text-gray-900 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                Submit
            </button>
        </div>
    </div>
  );
};

export default Controls;