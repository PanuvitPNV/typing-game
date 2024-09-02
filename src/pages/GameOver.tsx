import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface GameOverProps {
  playerName: string;
  score: number;
  wpm: number;
  typedWords: Array<{ word: string; meaning: string }>;
  onPlayAgain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ playerName, score, wpm, typedWords, onPlayAgain }) => {
  const navigate = useNavigate();
  const uniqueTypedWords = Array.from(new Set(typedWords.map(({ word }) => word)));

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Game Over, {playerName}!</h2>
      <p className="text-xl mb-2">Your score: {score}</p>
      <p className="text-xl mb-6">Your WPM: {wpm}</p>

      <ScrollArea className="h-96">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Word</TableHead>
              <TableHead className="text-center">Meaning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uniqueTypedWords.map((word, index) => {
              const { meaning } = typedWords.find((typedWord) => typedWord.word === word)!;
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

      <Button onClick={onPlayAgain} className="mr-2 mt-5">
        Play Again
      </Button>
      <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
        Home
      </Button>
    </>
  );
};

export default GameOver;