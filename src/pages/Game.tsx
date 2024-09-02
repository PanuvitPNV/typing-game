import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import GameOver from './GameOver';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from "@/components/ui/spinner";

interface GameState {
  currentWord: string;
  input: string;
  timeLeft: number;
  score: number;
  gameOver: boolean;
  difficulty: number;
  typedWords: Array<{ word: string; meaning: string }>;
  startTime: number;
  wpm: number;
}

const INITIAL_TIME = 30;
const TIME_DECREASE_RATE = 0.3;
const TIME_INCREASE_PER_WORD = 2;
const DIFFICULTY_INCREASE_RATE = 0.01;
const WRONG_CHARACTER_PENALTY = 0.5;

const fetchAllWords = async () => {
  const response = await fetch('https://random-word-api.herokuapp.com/all');
  return await response.json();
};

const fetchWordMeaning = async (word: string) => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = await response.json();
    return data[0].meanings[0].definitions[0].definition;
  } catch (error) {
    console.error('Error fetching word meaning:', error);
    return 'Meaning not available';
  }
};

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: '',
    input: '',
    timeLeft: INITIAL_TIME,
    score: 0,
    gameOver: false,
    difficulty: 1,
    typedWords: [],
    startTime: 0,
    wpm: 0,
  });
  const [countdown, setCountdown] = useState<number>(3);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(true);
  const [allWords, setAllWords] = useState<string[]>([]);
  const navigate = useNavigate();
  const playerName = document.cookie.replace(/(?:(?:^|.*;\s*)playerName\s*=\s*([^;]*).*$)|^.*$/, "$1") || 'Player';
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const { data: fetchedWords, isLoading: isLoadingWords } = useQuery({
    queryKey: ['allWords'],
    queryFn: fetchAllWords,
  });

  useEffect(() => {
    if (fetchedWords) {
      setAllWords(fetchedWords);
    }
  }, [fetchedWords]);

  const { data: wordMeaning, refetch: refetchMeaning } = useQuery({
    queryKey: ['wordMeaning', gameState.currentWord],
    queryFn: () => fetchWordMeaning(gameState.currentWord),
    enabled: false,
  });

  useEffect(() => {
    if (isCountdownActive) {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) return prev - 1;
          clearInterval(countdownInterval);
          setIsCountdownActive(false);
          return 0;
        });
      }, 1000);
      return () => clearInterval(countdownInterval);
    } else if (!isLoadingWords) {
      startGame();
    }
  }, [isCountdownActive, isLoadingWords]);

  useEffect(() => {
    if (!isCountdownActive && !isLoadingWords) {
      setGameState(prev => ({ ...prev, currentWord: getRandomWord(), startTime: Date.now() }));
    }
  }, [isCountdownActive, isLoadingWords]);

  useEffect(() => {
    if (gameState.currentWord) {
      refetchMeaning();
    }
  }, [gameState.currentWord, refetchMeaning]);

  const getRandomWord = (): string => {
    return allWords[Math.floor(Math.random() * allWords.length)];
  };

  const startGame = () => {
    lastUpdateTimeRef.current = Date.now();
    gameLoopRef.current = setInterval(updateGameState, 100);
  };

  const updateGameState = () => {
    const now = Date.now();
    const timePassed = (now - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = now;
    
    setGameState(prev => {
      const newTimeLeft = Math.max(0, prev.timeLeft - timePassed * TIME_DECREASE_RATE * prev.difficulty);
      const elapsedMinutes = (now - prev.startTime) / 60000;
      const newWpm = elapsedMinutes > 0 ? Math.round(prev.score / elapsedMinutes) : 0;

      if (newTimeLeft <= 0.1) {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        return { ...prev, gameOver: true, timeLeft: 0, wpm: newWpm };
      }
      return { 
        ...prev, 
        timeLeft: newTimeLeft, 
        difficulty: Math.min(prev.difficulty + prev.score * DIFFICULTY_INCREASE_RATE, 3),
        wpm: newWpm
      };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const currentWord = gameState.currentWord;

    setGameState(prev => {
      let newTimeLeft = prev.timeLeft;
      if (inputValue !== currentWord.slice(0, inputValue.length)) {
        newTimeLeft = Math.max(0, newTimeLeft - WRONG_CHARACTER_PENALTY * prev.difficulty);
      }

      if (inputValue === currentWord) {
        const newWord = getRandomWord();
        const now = Date.now();
        const elapsedMinutes = (now - prev.startTime) / 60000;
        const newWpm = elapsedMinutes > 0 ? Math.round((prev.score + 1) / elapsedMinutes) : 0;
        return {
          ...prev,
          currentWord: newWord,
          score: prev.score + 1,
          timeLeft: Math.min(INITIAL_TIME, newTimeLeft + TIME_INCREASE_PER_WORD / prev.difficulty),
          input: '',
          typedWords: [...prev.typedWords, { word: currentWord, meaning: wordMeaning || 'Meaning not available' }],
          wpm: newWpm
        };
      }
      return { ...prev, input: inputValue, timeLeft: newTimeLeft };
    });
  };

  const handlePlayAgain = () => {
    setGameState({
      currentWord: '',
      input: '',
      timeLeft: INITIAL_TIME,
      score: 0,
      gameOver: false,
      difficulty: 1,
      typedWords: [],
      startTime: Date.now(),
      wpm: 0,
    });
    setCountdown(3);
    setIsCountdownActive(true);
    lastUpdateTimeRef.current = Date.now();
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  const renderWord = () => {
    return gameState.currentWord.split('').map((char, index) => {
      let className = 'text-4xl transition-all duration-150 inline-block';
      if (index < gameState.input.length) {
        if (gameState.input[index] === char) {
          className += ' text-green-500 transform scale-110';
        } else {
          className += ' text-red-500 animate-shake';
        }
      }
      return <span key={index} className={className}>{char}</span>;
    });
  };

  if (isLoadingWords) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <Spinner size="lg" />
        <div className="ml-4 text-2xl font-bold">Loading words...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md text-center">
        {isCountdownActive ? (
          <h2 className="text-4xl font-bold mb-4">Get Ready {playerName}! {countdown}</h2>
        ) : !gameState.gameOver ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Type the word:</h2>
            <p className="mb-6">{renderWord()}</p>
            <Input
              type="text"
              value={gameState.input}
              onChange={handleInputChange}
              onPaste={(e) => e.preventDefault()}
              className="w-full mb-4"
              autoFocus
            />
            <Progress value={(gameState.timeLeft / INITIAL_TIME) * 100} className="mb-4" />
            <div className="flex justify-between mb-4 text-xl font-semibold">
              <p className="bg-blue-100 px-3 py-1 rounded-full">
                Time: {gameState.timeLeft.toFixed(2)}s
              </p>
              <p className="bg-green-100 px-3 py-1 rounded-full">
                Score: {gameState.score}
              </p>
              <p className="bg-yellow-100 px-3 py-1 rounded-full">
                WPM: {gameState.wpm}
              </p>
            </div>
          </>
        ) : (
          <GameOver
            playerName={playerName}
            score={gameState.score}
            typedWords={gameState.typedWords}
            onPlayAgain={handlePlayAgain}
            wpm={gameState.wpm}
          />
        )}
      </div>
    </div>
  );
};

export default Game;