import React from 'react';
import { GuessedGroup } from '../types.ts';
import { GROUP_COLORS_DARK_TEXT } from '../constants.ts';

interface GuessedGroupRowProps {
  group: GuessedGroup;
}

const GuessedGroupRow: React.FC<GuessedGroupRowProps> = ({ group }) => {
  const colorClass = GROUP_COLORS_DARK_TEXT[group.level] || 'bg-gray-500';

  return (
    <div className={`p-4 rounded-lg text-center transition-all duration-500 ${colorClass}`}>
      <p className="font-bold text-lg uppercase">{group.category}</p>
      <p className="font-semibold uppercase text-sm">{group.words.join(', ')}</p>
    </div>
  );
};

export default GuessedGroupRow;