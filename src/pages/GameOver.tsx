import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DifficultyLevel } from '../utils/gameConfig';

interface GameOverProps {
  playerName: string;
  score: number;
  wpm: number;
  typedWords: Array<{ word: string; meaning: string }>;
  onPlayAgain: () => void;
  difficulty: DifficultyLevel;
  time: number;
}

const GameOver: React.FC<GameOverProps> = ({ playerName, score, wpm, typedWords, onPlayAgain, difficulty, time }) => {
  const navigate = useNavigate();
  const uniqueTypedWords = Array.from(new Set(typedWords.map(({ word }) => word)));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Game Over, {playerName}!</h2>
      <p className="text-xl mb-2 text-gray-700 dark:text-gray-300">Your score: {score}</p>
      <p className="text-xl mb-2 text-gray-700 dark:text-gray-300">Your WPM: {wpm}</p>
      <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">Difficulty: {difficulty} | Time: {time} seconds</p>

      <ScrollArea className="h-96 mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Word</TableHead>
              <TableHead className="text-center">Meaning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uniqueTypedWords.map((word, index) => {
              const { meaning } = typedWords.find((typedWord) => typedWord.word === word) || { meaning: 'N/A' };
              return (
                <TableRow key={index}>
                  <TableCell>{word}</TableCell>
                  <TableCell>{meaning}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="flex justify-between">
        <Button onClick={onPlayAgain}>
          Play Again
        </Button>
        <Button onClick={() => navigate('/')} variant="outline">
          Home
        </Button>
      </div>
    </div>
  );
};

export default GameOver;