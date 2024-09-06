import React from 'react';
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { gameConfig, DifficultyLevel } from '../utils/gameConfig';

interface GameUIProps {
  currentWord: string;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  timeLeft: number;
  score: number;
  wpm: number;
  renderWord: () => React.ReactNode;
  difficulty: DifficultyLevel;
  initialTime: number;
}

const GameUI: React.FC<GameUIProps> = ({
  currentWord,
  input,
  handleInputChange,
  timeLeft,
  score,
  wpm,
  renderWord,
  difficulty,
  initialTime
}) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Type the word:</h2>
      <div className="mb-6 text-center">{renderWord()}</div>
      <Input
        type="text"
        value={input}
        onChange={handleInputChange}
        onPaste={(e) => e.preventDefault()}
        className="w-full mb-4 text-lg"
        autoFocus
      />
      <Progress value={(timeLeft / initialTime) * 100} className="mb-4" />
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Time</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{timeLeft.toFixed(1)}s</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">Score</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{score}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">WPM</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">{wpm}</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Difficulty: {difficulty}</p>
      </div>
    </div>
  );
};

export default GameUI;