import { useState, useEffect } from 'react';

export type DifficultyLevel = 'easy' | 'normal' | 'hard';
export type ColorScheme = 'light' | 'dark' | 'system';

export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('system');

  useEffect(() => {
    const savedScheme = localStorage.getItem('colorScheme') as ColorScheme;
    if (savedScheme) setColorScheme(savedScheme);
  }, []);

  const updateColorScheme = (newScheme: ColorScheme) => {
    setColorScheme(newScheme);
    localStorage.setItem('colorScheme', newScheme);
  };

  return { colorScheme, updateColorScheme };
};

export const gameConfig = {
  TIME_DECREASE_RATE: {
    easy: 0.2,
    normal: 0.3,
    hard: 0.4,
  },
  TIME_INCREASE_PER_WORD: {
    easy: 3,
    normal: 2,
    hard: 1,
  },
  WRONG_CHARACTER_PENALTY: {
    easy: 0.3,
    normal: 0.5,
    hard: 0.7,
  },
};