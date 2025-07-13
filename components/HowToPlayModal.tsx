import React from 'react';

interface HowToPlayModalProps {
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-lg w-full text-left shadow-lg transform transition-all relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-3xl font-bold mb-4 text-center">How to Play Farnect</h2>
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="font-bold text-lg text-white">Find groups of four!</h3>
            <p>Each puzzle has 16 words, which can be sorted into four distinct groups of four based on a shared connection.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Select and Submit</h3>
            <p>Tap on four words you think form a group. Once you have four selected, hit the "Submit" button to check your guess.</p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Mistakes</h3>
            <p>You have four mistakes available. Making an incorrect guess will use one up. The game ends if you run out of mistakes.</p>
          </div>
           <div>
            <h3 className="font-bold text-lg text-white">Color-coded Categories</h3>
            <p>The categories are color-coded by difficulty:</p>
            <ul className="list-disc list-inside mt-2">
                <li><span className="font-bold text-yellow-400">Yellow:</span> Easiest</li>
                <li><span className="font-bold text-green-400">Green:</span> Straightforward</li>
                <li><span className="font-bold text-blue-400">Blue:</span> Tricky</li>
                <li><span className="font-bold text-purple-400">Purple:</span> Most difficult connection</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Hints</h3>
            <p>Stuck? Use a hint! Hints can reveal a word from an unsolved group or the name of an unsolved category. You can purchase more if you run out.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;