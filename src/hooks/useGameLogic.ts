import { useState, useRef, useCallback } from 'react';

const INITIAL_TIME = 30;
const TIME_DECREASE_RATE = 0.3;
const TIME_INCREASE_PER_WORD = 2;
const DIFFICULTY_INCREASE_RATE = 0.01;
const WRONG_CHARACTER_PENALTY = 0.5;

interface GameState {
  currentWord: string;
  input: string;
  timeLeft: number;
  score: number;
  gameOver: boolean;
  difficulty: number;
  typedWords: Array<{ word: string; meaning: string }>;
  wpm: number;
  playerName: string;
}

const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: '',
    input: '',
    timeLeft: INITIAL_TIME,
    score: 0,
    gameOver: false,
    difficulty: 1,
    typedWords: [],
    wpm: 0,
    playerName: localStorage.getItem('playerName') || 'Player',
  });

  const lastUpdateTimeRef = useRef<number>(Date.now());
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const getRandomWord = useCallback((words: string[]) => {
    return words[Math.floor(Math.random() * words.length)];
  }, []);

  const startGame = useCallback((words: string[]) => {
    startTimeRef.current = Date.now();
    lastUpdateTimeRef.current = Date.now();
    setGameState(prev => ({ ...prev, currentWord: getRandomWord(words) }));
    gameLoopRef.current = setInterval(() => updateGameState(words), 100);
  }, [getRandomWord]);

  const updateGameState = useCallback((words: string[]) => {
    const now = Date.now();
    const timePassed = (now - lastUpdateTimeRef.current) / 1000;
    lastUpdateTimeRef.current = now;
    
    setGameState(prev => {
      const newTimeLeft = Math.max(0, prev.timeLeft - timePassed * TIME_DECREASE_RATE * prev.difficulty);
      const elapsedMinutes = (now - (startTimeRef.current || now)) / 60000;
      const newWpm = Math.round(prev.score / elapsedMinutes) || 0;

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
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, words: string[]) => {
    const inputValue = e.target.value;
    const currentWord = gameState.currentWord;

    setGameState(prev => {
      let newTimeLeft = prev.timeLeft;
      if (inputValue !== currentWord.slice(0, inputValue.length)) {
        newTimeLeft = Math.max(0, newTimeLeft - WRONG_CHARACTER_PENALTY * prev.difficulty);
      }

      if (inputValue === currentWord) {
        const newWord = getRandomWord(words);
        return {
          ...prev,
          currentWord: newWord,
          score: prev.score + 1,
          timeLeft: Math.min(INITIAL_TIME, newTimeLeft + TIME_INCREASE_PER_WORD / prev.difficulty),
          input: '',
          typedWords: [...prev.typedWords, { word: currentWord, meaning: 'Meaning not available' }],
        };
      }
      return { ...prev, input: inputValue, timeLeft: newTimeLeft };
    });
  }, [gameState.currentWord, getRandomWord]);

  const handlePlayAgain = useCallback(() => {
    setGameState({
      currentWord: '',
      input: '',
      timeLeft: INITIAL_TIME,
      score: 0,
      gameOver: false,
      difficulty: 1,
      typedWords: [],
      wpm: 0,
      playerName: gameState.playerName,
    });
    lastUpdateTimeRef.current = Date.now();
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  }, [gameState.playerName]);

  return {
    gameState,
    handleInputChange,
    handlePlayAgain,
    startGame,
    updateGameState,
  };
};

export default useGameLogic;