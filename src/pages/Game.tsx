import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import Countdown from '../components/Countdown';
import GameUI from '../components/GameUI';
import GameOver from './GameOver';
import LoadingScreen from '../components/LoadingScreen';
import { fetchAllWords, fetchWordMeaning } from '../utils/wordUtils';
import { gameConfig, DifficultyLevel, useColorScheme } from '../utils/gameConfig';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GameState {
  currentWord: string;
  input: string;
  timeLeft: number;
  score: number;
  gameOver: boolean;
  difficulty: DifficultyLevel;
  typedWords: Array<{ word: string; meaning: string }>;
  wpm: number;
}

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: '',
    input: '',
    timeLeft: 60,
    score: 0,
    gameOver: false,
    difficulty: 'normal',
    typedWords: [],
    wpm: 0,
  });
  const [countdown, setCountdown] = useState<number>(3);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
  const [allWords, setAllWords] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<number>(60);
  const [backgroundColor, setBackgroundColor] = useState<string>('from-blue-500 to-purple-600');
  const { colorScheme, updateColorScheme } = useColorScheme();
  const playerName = localStorage.getItem('playerName') || 'Player';
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const wordsTypedRef = useRef<number>(0);
  const confettiShownRef = useRef<boolean>(false);

  const { data: fetchedWords, isLoading: isLoadingWords } = useQuery({
    queryKey: ['allWords'],
    queryFn: fetchAllWords,
  });

  useEffect(() => {
    if (fetchedWords) setAllWords(fetchedWords);
  }, [fetchedWords]);

  const { data: wordMeaning, refetch: refetchMeaning } = useQuery({
    queryKey: ['wordMeaning', gameState.currentWord],
    queryFn: () => fetchWordMeaning(gameState.currentWord),
    enabled: false,
  });

  useEffect(() => {
    if (gameState.currentWord) refetchMeaning();
  }, [gameState.currentWord, refetchMeaning]);

  const getRandomWord = useCallback(() => allWords[Math.floor(Math.random() * allWords.length)], [allWords]);

  const startGame = useCallback(() => {
    startTimeRef.current = Date.now();
    lastUpdateTimeRef.current = Date.now();
    setGameState(prev => ({ ...prev, currentWord: getRandomWord(), timeLeft: selectedTime }));
    gameLoopRef.current = setInterval(updateGameState, 100);
  }, [getRandomWord, selectedTime]);

  const updateGameState = useCallback(() => {
    const now = Date.now();
    const timePassed = (now - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = now;
    
    setGameState(prev => {
      if (prev.gameOver) return prev;

      const newTimeLeft = Math.max(0, prev.timeLeft - timePassed * gameConfig.TIME_DECREASE_RATE[prev.difficulty]);
      const elapsedMinutes = (now - (startTimeRef.current || now)) / 60000;
      const newWpm = Math.round(wordsTypedRef.current / elapsedMinutes) || 0;

      if (newTimeLeft <= 0.1) {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (!confettiShownRef.current) {
          confetti();
          confettiShownRef.current = true;
        }
        saveScore(prev.score, newWpm, prev.difficulty);
        return { ...prev, gameOver: true, timeLeft: 0, wpm: newWpm };
      }
      return { ...prev, timeLeft: newTimeLeft, wpm: newWpm };
    });
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const currentWord = gameState.currentWord;

    setGameState(prev => {
      if (prev.gameOver) return prev;

      let newTimeLeft = prev.timeLeft;
      if (inputValue !== currentWord.slice(0, inputValue.length)) {
        newTimeLeft = Math.max(0, newTimeLeft - gameConfig.WRONG_CHARACTER_PENALTY[prev.difficulty]);
      }

      if (inputValue === currentWord) {
        const newWord = getRandomWord();
        wordsTypedRef.current += 1;
        return {
          ...prev,
          currentWord: newWord,
          score: prev.score + 1,
          timeLeft: Math.min(selectedTime, newTimeLeft + gameConfig.TIME_INCREASE_PER_WORD[prev.difficulty]),
          input: '',
          typedWords: [...prev.typedWords, { word: currentWord, meaning: wordMeaning || 'Meaning not available' }],
        };
      }
      return { ...prev, input: inputValue, timeLeft: newTimeLeft };
    });
  }, [gameState.currentWord, getRandomWord, wordMeaning, selectedTime]);

  const handlePlayAgain = useCallback(() => {
    setGameState({
      currentWord: '',
      input: '',
      timeLeft: selectedTime,
      score: 0,
      gameOver: false,
      difficulty: gameState.difficulty,
      typedWords: [],
      wpm: 0,
    });
    setCountdown(3);
    setIsCountdownActive(true);
    lastUpdateTimeRef.current = Date.now();
    wordsTypedRef.current = 0;
    confettiShownRef.current = false;
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  }, [selectedTime, gameState.difficulty]);

  const saveScore = (score: number, wpm: number, difficulty: DifficultyLevel) => {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({ playerName, score, wpm, difficulty, time: selectedTime });
    scores.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    localStorage.setItem('scores', JSON.stringify(scores.slice(0, 15)));
  };

  const renderWord = () => {
    return gameState.currentWord.split('').map((char, index) => {
      let className = 'text-4xl transition-all duration-150 inline-block';
      if (index < gameState.input.length) {
        className += gameState.input[index] === char ? ' text-green-500 transform scale-110' : ' text-red-500 animate-shake';
      }
      return <span key={index} className={className}>{char}</span>;
    });
  };

  const handleStartGame = () => {
    setIsCountdownActive(true);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;
        clearInterval(countdownInterval);
        setIsCountdownActive(false);
        startGame();
        return 0;
      });
    }, 1000);
  };

  if (isLoadingWords) return <LoadingScreen />;

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-r ${backgroundColor} dark:from-gray-800 dark:to-gray-900 p-4`}>
      <div className="w-full max-w-md">
        {!isCountdownActive && !gameState.currentWord ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Game Settings</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Time:</label>
              <Select onValueChange={(value) => setSelectedTime(Number(value))} defaultValue="60">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="120">2 minutes</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Difficulty:</label>
              <Select onValueChange={(value) => setGameState(prev => ({ ...prev, difficulty: value as DifficultyLevel }))} defaultValue="normal">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Background:</label>
              <Select onValueChange={setBackgroundColor} defaultValue="from-blue-500 to-purple-600">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="from-blue-500 to-purple-600">Blue to Purple</SelectItem>
                  <SelectItem value="from-green-400 to-blue-500">Green to Blue</SelectItem>
                  <SelectItem value="from-pink-500 to-yellow-500">Pink to Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color Scheme:</label>
              <Select onValueChange={updateColorScheme} defaultValue={colorScheme}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleStartGame} className="w-full">Start Game</Button>
          </div>
        ) : isCountdownActive ? (
          <Countdown count={countdown} />
        ) : !gameState.gameOver ? (
          <GameUI
            currentWord={gameState.currentWord}
            input={gameState.input}
            handleInputChange={handleInputChange}
            timeLeft={gameState.timeLeft}
            score={gameState.score}
            wpm={gameState.wpm}
            renderWord={renderWord}
            difficulty={gameState.difficulty}
            initialTime={selectedTime}
          />
        ) : (
          <GameOver
            playerName={playerName}
            score={gameState.score}
            wpm={gameState.wpm}
            typedWords={gameState.typedWords}
            onPlayAgain={handlePlayAgain}
            difficulty={gameState.difficulty}
            time={selectedTime}
          />
        )}
      </div>
    </div>
  );
};

export default Game;