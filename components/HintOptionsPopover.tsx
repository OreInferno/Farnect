import React from 'react';

type HintType = 'word' | 'category';

interface HintOptionsPopoverProps {
    wordHintsLeft: number;
    categoryHintsLeft: number;
    isGettingHint: boolean;
    onGetHint: (type: HintType) => void;
    onClose: () => void;
}

const HintButton: React.FC<{
    title: string;
    description: string;
    hintsLeft: number;
    onClick: () => void;
    disabled: boolean;
}> = ({ title, description, hintsLeft, onClick, disabled }) => {
    const hasHints = hintsLeft > 0;
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="text-left p-3 rounded-lg w-full transition-colors bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="flex justify-between items-center">
                <span className="font-bold">{title}</span>
                <span className={`font-semibold text-sm px-2 py-0.5 rounded-full ${hasHints ? 'bg-blue-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                    {hasHints ? `${hintsLeft} left` : 'Get More'}
                </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{description}</p>
        </button>
    );
};

const HintOptionsPopover: React.FC<HintOptionsPopoverProps> = ({
    wordHintsLeft,
    categoryHintsLeft,
    isGettingHint,
    onGetHint,
    onClose,
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div
                className="bg-gray-800 rounded-2xl p-4 max-w-sm w-full shadow-lg transform transition-all relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h3 className="text-xl font-bold text-center mb-4">Choose a Hint</h3>
                <div className="space-y-3">
                    <HintButton
                        title="Reveal a Word"
                        description="Shows one correct word from an unsolved group."
                        hintsLeft={wordHintsLeft}
                        onClick={() => onGetHint('word')}
                        disabled={isGettingHint}
                    />
                    <HintButton
                        title="Reveal a Category"
                        description="Shows the name of one unsolved category."
                        hintsLeft={categoryHintsLeft}
                        onClick={() => onGetHint('category')}
                        disabled={isGettingHint}
                    />
                </div>
            </div>
        </div>
    );
};

export default HintOptionsPopover;