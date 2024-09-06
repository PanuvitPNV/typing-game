import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DifficultyLevel } from '../utils/gameConfig';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Score {
  playerName: string;
  score: number;
  wpm: number;
  difficulty: DifficultyLevel;
  time: number;
}

interface ScoreboardProps {
  className?: string;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ className }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedTime, setSelectedTime] = useState<number | 'all'>('all');

  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem('scores') || '[]') as Score[];
    setScores(storedScores);
  }, []);

  const filteredScores = scores.filter(score => 
    (selectedDifficulty === 'all' || score.difficulty === selectedDifficulty) &&
    (selectedTime === 'all' || score.time === selectedTime)
  ).sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Top Scores</h2>
      <div className="flex justify-between mb-4">
        <Select onValueChange={(value) => setSelectedDifficulty(value as DifficultyLevel | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => setSelectedTime(value === 'all' ? 'all' : Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Times</SelectItem>
            <SelectItem value="30">30 seconds</SelectItem>
            <SelectItem value="60">1 minute</SelectItem>
            <SelectItem value="120">2 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="h-72 ">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">WPM</TableHead>
            <TableHead className="text-right">Difficulty</TableHead>
            <TableHead className="text-right">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredScores.map((score, index) => (
            <TableRow key={index}>
              <TableCell className="text-center font-medium">{index + 1}</TableCell>
              <TableCell>{score.playerName}</TableCell>
              <TableCell className="text-right">{score.score}</TableCell>
              <TableCell className="text-right">{score.wpm}</TableCell>
              <TableCell className="text-right">{score.difficulty}</TableCell>
              <TableCell className="text-right">{score.time}s</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </ScrollArea>
    </div>
  );
};

export default Scoreboard;